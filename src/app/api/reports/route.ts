import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validations";
import { clientIp, isSameOrigin, jsonError, readJson } from "@/lib/security/request";
import { rateLimit } from "@/lib/rate-limit";
import { bumpStats } from "@/lib/analytics/server";

export const runtime = "nodejs";

/** Open reports at which a quiz is hidden automatically until a moderator reviews it. */
const AUTO_DISABLE_THRESHOLD = 5;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  if (!isSupabaseConfigured()) return jsonError(503, "Service not configured");

  const ip = clientIp(req);
  const rl = await rateLimit("report", ip);
  if (!rl.success) return jsonError(429, "Thanks, we've received your reports. Please try again later.");

  let body: unknown;
  try {
    body = await readJson(req, 4_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, parsed.error.issues[0]?.message || "Invalid report");
  const { slug, reason, details } = parsed.data;

  const { data: quiz } = await db().from("quizzes").select("id, title").eq("slug", slug).maybeSingle();
  if (!quiz) return jsonError(404, "Quiz not found");

  const { error } = await db().from("reports").insert({
    quiz_id: quiz.id,
    quiz_slug: slug,
    title_snapshot: quiz.title,
    reason,
    details: details || null,
  });
  if (error) {
    console.error("[report]", error.message);
    return jsonError(500, "Couldn't send the report. Please try again.");
  }

  const { count } = await db()
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("quiz_id", quiz.id)
    .eq("status", "open");
  if ((count ?? 0) >= AUTO_DISABLE_THRESHOLD) {
    await db().from("quizzes").update({ status: "disabled" }).eq("id", quiz.id);
    revalidatePath(`/quiz/${slug}`);
  }

  await bumpStats([{ m: "report_submitted", d: reason }]);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
