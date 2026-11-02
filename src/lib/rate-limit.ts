import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sha256Hex } from "@/lib/security/tokens";

/**
 * Rate limiting with Upstash Redis (sliding window). Keys are hashed so raw IPs never reach Redis.
 * Without Upstash env vars we fall back to an in-memory limiter, which is only suitable for local dev
 * (each serverless instance would have its own memory).
 */

type Rule = { limit: number; window: `${number} ${"s" | "m" | "h" | "d"}` };

export const RULES = {
  createQuiz: { limit: 5, window: "1 h" },
  createQuizBurst: { limit: 2, window: "1 m" },
  attemptPerQuiz: { limit: 6, window: "1 h" }, // retakes allowed, but not spam
  attemptGlobal: { limit: 60, window: "1 h" },
  report: { limit: 5, window: "1 h" },
  track: { limit: 240, window: "1 m" },
  dashboard: { limit: 60, window: "1 m" },
  adminLogin: { limit: 5, window: "15 m" },
  storyImage: { limit: 30, window: "1 m" },
} satisfies Record<string, Rule>;

export type RuleName = keyof typeof RULES;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null;

const limiters = new Map<RuleName, Ratelimit>();

function limiter(name: RuleName) {
  if (!redis) return null;
  let l = limiters.get(name);
  if (!l) {
    const rule = RULES[name];
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(rule.limit, rule.window),
      prefix: `wkyb:rl:${name}`,
      analytics: false,
      ephemeralCache: new Map(),
    });
    limiters.set(name, l);
  }
  return l;
}

// ---- in-memory fallback (dev only) ----
const memory = new Map<string, { count: number; reset: number }>();
function windowMs(w: Rule["window"]) {
  const [n, unit] = w.split(" ") as [string, "s" | "m" | "h" | "d"];
  return Number(n) * { s: 1e3, m: 6e4, h: 3.6e6, d: 8.64e7 }[unit];
}
function memoryLimit(key: string, rule: Rule) {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs(rule.window) });
    if (memory.size > 10_000) memory.clear();
    return { success: true, reset: now + windowMs(rule.window) };
  }
  entry.count++;
  return { success: entry.count <= rule.limit, reset: entry.reset };
}

export async function rateLimit(name: RuleName, ...parts: string[]) {
  const key = sha256Hex(parts.join("|")).slice(0, 32);
  const l = limiter(name);
  if (!l) return memoryLimit(`${name}:${key}`, RULES[name]);
  try {
    const r = await l.limit(key);
    return { success: r.success, reset: r.reset };
  } catch (err) {
    // Redis outage: fail open so the product keeps working; Turnstile + idempotency still protect writes.
    console.error("[rate-limit] redis error", err);
    return { success: true, reset: Date.now() };
  }
}

export function retryAfterSeconds(reset: number) {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}
