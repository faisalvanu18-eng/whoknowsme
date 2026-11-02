import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { trackSchema } from "@/lib/validations";
import { clientIp, isSameOrigin, readJson } from "@/lib/security/request";
import { rateLimit } from "@/lib/rate-limit";
import { bumpStats } from "@/lib/analytics/server";

export const runtime = "nodejs";

const NO_CONTENT = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/**
 * First-party aggregate counter endpoint. Increments daily_stats only; no per-user rows,
 * no IPs, no cookies. Invalid or rate-limited calls are silently dropped.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req) || !isSupabaseConfigured()) return NO_CONTENT();
  const rl = await rateLimit("track", clientIp(req));
  if (!rl.success) return NO_CONTENT();

  let body: unknown;
  try {
    body = await readJson(req, 1_000);
  } catch {
    return NO_CONTENT();
  }
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return NO_CONTENT();
  const { event, channel, slug, dim } = parsed.data;

  try {
    if (event === "share_clicked" || event === "result_shared") {
      await db().rpc("track_share", {
        p_slug: slug ?? null,
        p_channel: channel ?? "other",
        p_kind: event === "result_shared" ? "result" : "quiz",
      });
    } else {
      await bumpStats([{ m: event, d: dim ?? "" }]);
    }
  } catch (err) {
    console.error("[track]", err);
  }
  return NO_CONTENT();
}
