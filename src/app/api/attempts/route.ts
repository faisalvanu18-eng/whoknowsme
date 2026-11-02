import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { submitAttemptSchema } from "@/lib/validations";
import { clientIp, isSameOrigin, jsonError, readJson } from "@/lib/security/request";
import { newRefCode, sha256Hex } from "@/lib/security/tokens";
import { rateLimit, retryAfterSeconds } from "@/lib/rate-limit";
import { RETENTION_DAYS } from "@/lib/site";

export const runtime = "nodejs";

type SubmitResult = {
  attempt_id: string;
  score: number;
  total: number;
  percentile: number | null;
  others: number;
  ref_code: string;
  duplicate: boolean;
};

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  if (!isSupabaseConfigured()) return jsonError(503, "Service not configured");

  let body: unknown;
  try {
    body = await readJson(req, 4_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = submitAttemptSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message || "Invalid answers");
  const input = parsed.data;

  const ip = clientIp(req);
  const [perQuiz, global] = await Promise.all([
    rateLimit("attemptPerQuiz", ip, input.slug),
    rateLimit("attemptGlobal", ip),
  ]);
  if (!perQuiz.success || !global.success) {
    return jsonError(429, "Whoa, lots of retakes! Give it a little while before trying again.", {
      retryAfter: retryAfterSeconds(perQuiz.success ? global.reset : perQuiz.reset),
    });
  }

  const viewKey = randomBytes(24).toString("base64url");
  const viewKeyHash = sha256Hex(viewKey);

  // Scoring, attempt insert, batch response insert and counters: ONE database transaction.
  const { data, error } = await db().rpc("submit_attempt", {
    p_slug: input.slug,
    p_answers: input.answers,
    p_idempotency_key: input.idempotencyKey,
    p_view_key_hash: viewKeyHash,
    p_ref_code: newRefCode(),
    p_nickname: input.nickname ?? null,
    p_referred_by: input.ref ?? null,
  });

  if (error) {
    if (error.code === "P0002") return jsonError(404, "This quiz is no longer available.");
    if (error.code === "22023") return jsonError(400, "Those answers don't match this quiz. Please reload and try again.");
    console.error("[submit_attempt]", error.code, error.message);
    return jsonError(500, "Couldn't save your answers. Please try again.");
  }

  const result = data as SubmitResult;

  // Retry of an already-saved attempt: rotate its view key so this device can see the review.
  // Safe because only the original client knows the random idempotency key.
  if (result.duplicate) {
    await db()
      .from("attempts")
      .update({ view_key_hash: viewKeyHash })
      .eq("id", result.attempt_id)
      .eq("idempotency_key", input.idempotencyKey);
  }

  const res = NextResponse.json(
    {
      ok: true,
      attemptId: result.attempt_id,
      score: result.score,
      total: result.total,
      percentile: result.percentile,
      others: result.others,
      refCode: result.ref_code,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
  // httpOnly, path-scoped key that unlocks the correct/incorrect review on the result page.
  res.cookies.set(`wkr_${result.attempt_id.replace(/-/g, "")}`, viewKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/result/${result.attempt_id}`,
    maxAge: RETENTION_DAYS * 86400,
  });
  return res;
}
