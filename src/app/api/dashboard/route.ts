import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { dashboardActionSchema } from "@/lib/validations";
import { clientIp, isSameOrigin, jsonError, readJson } from "@/lib/security/request";
import { sha256Hex } from "@/lib/security/tokens";
import { rateLimit } from "@/lib/rate-limit";
import { QUIZ_EXPIRY_DAYS } from "@/lib/site";

export const runtime = "nodejs";

/** Creator actions. Authorised solely by the secret token (compared via its SHA-256 hash). */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  if (!isSupabaseConfigured()) return jsonError(503, "Service not configured");
  const rl = await rateLimit("dashboard", clientIp(req));
  if (!rl.success) return jsonError(429, "Too many requests. Try again in a minute.");

  let body: unknown;
  try {
    body = await readJson(req, 2_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = dashboardActionSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Invalid request");
  const { token, action } = parsed.data;
  const tokenHash = sha256Hex(token);

  const { data: quiz } = await db().from("quizzes").select("id, slug").eq("token_hash", tokenHash).maybeSingle();
  if (!quiz) return jsonError(404, "Quiz not found. It may already be deleted.");

  if (action === "delete") {
    // cascades to questions, attempts and responses; reports keep their snapshot
    const { error } = await db().from("quizzes").delete().eq("id", quiz.id).eq("token_hash", tokenHash);
    if (error) return jsonError(500, "Couldn't delete. Please try again.");
  } else {
    const expires_at = action === "set_expiry" ? new Date(Date.now() + QUIZ_EXPIRY_DAYS * 864e5).toISOString() : null;
    const { error } = await db().from("quizzes").update({ expires_at }).eq("id", quiz.id);
    if (error) return jsonError(500, "Couldn't update. Please try again.");
  }

  revalidatePath(`/quiz/${quiz.slug}`);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
