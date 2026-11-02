import { NextResponse } from "next/server";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { createQuizSchema } from "@/lib/validations";
import { clientIp, isSameOrigin, jsonError, readJson } from "@/lib/security/request";
import { newCreatorToken, newRefCode, newSlug, sha256Hex } from "@/lib/security/tokens";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit, retryAfterSeconds } from "@/lib/rate-limit";
import { QUIZ_EXPIRY_DAYS, SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  if (!isSupabaseConfigured()) return jsonError(503, "Service not configured");

  const ip = clientIp(req);
  const [burst, hourly] = await Promise.all([rateLimit("createQuizBurst", ip), rateLimit("createQuiz", ip)]);
  if (!burst.success || !hourly.success) {
    const reset = Math.max(burst.success ? 0 : burst.reset, hourly.success ? 0 : hourly.reset);
    return jsonError(429, "Bahut jaldi jaldi quiz ban rahe hain! Thodi der ruko aur phir try karo.", {
      retryAfter: retryAfterSeconds(reset),
    });
  }

  let body: unknown;
  try {
    body = await readJson(req, 24_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = createQuizSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError(400, issue?.message || "Invalid quiz", { path: issue?.path });
  }
  const input = parsed.data;

  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return jsonError(403, "Bot check failed. Please refresh the page and try again.");
  }

  const token = newCreatorToken();
  const questions = input.questions.map((q) => ({
    text: q.text,
    options: q.options,
    correct_index: q.correctIndex,
    category: q.category || "custom",
    bank_id: q.bankId ?? "",
  }));

  // Slug / ref collisions are astronomically rare (40-bit space) but handled anyway.
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = newSlug();
    const refCode = newRefCode();
    const { error } = await db().rpc("create_quiz", {
      p_quiz: {
        slug,
        title: input.title,
        creator_nickname: input.nickname,
        avatar: input.avatar,
        pack: input.pack,
        size: input.size,
        token_hash: sha256Hex(token),
        ref_code: refCode,
        referred_by: input.ref ?? "",
        source: input.source,
        expires_at: input.expire30 ? new Date(Date.now() + QUIZ_EXPIRY_DAYS * 864e5).toISOString() : "",
      },
      p_questions: questions,
    });
    if (!error) {
      return NextResponse.json(
        {
          ok: true,
          slug,
          refCode,
          token,
          quizUrl: `${SITE_URL}/quiz/${slug}`,
          dashboardUrl: `${SITE_URL}/dashboard/${token}`,
        },
        { status: 201, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error.code !== "23505") {
      console.error("[create_quiz]", error.code, error.message);
      return jsonError(500, "Couldn't publish your quiz. Please try again.");
    }
  }
  return jsonError(500, "Couldn't publish your quiz. Please try again.");
}
