import { ImageResponse } from "next/og";
import { getPublicQuiz, getResult } from "@/lib/quiz-data";
import { ShareCard } from "@/lib/og";
import { tierFor } from "@/lib/scoring";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/security/request";

export const runtime = "nodejs";

const SIZE = { width: 1080, height: 1920 };

/** Instagram Story image (9:16). ?quiz=<slug> or ?result=<attemptId>. */
export async function GET(req: Request) {
  const rl = await rateLimit("storyImage", clientIp(req));
  if (!rl.success) return new Response("Too many requests", { status: 429 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("quiz");
  const resultId = url.searchParams.get("result");
  const headers = { "Cache-Control": "public, max-age=3600, s-maxage=86400", "Content-Disposition": 'inline; filename="who-knows-you-better.png"' };

  if (resultId) {
    const r = await getResult(resultId).catch(() => null);
    if (!r) return new Response("Not found", { status: 404 });
    return new ImageResponse(
      <ShareCard
        variant="story"
        avatar={r.quiz.avatar}
        nickname={r.quiz.nickname}
        title={r.quiz.title}
        score={{ score: r.score, total: r.total, tier: tierFor(r.score, r.total).title, friend: r.nickname }}
      />,
      { ...SIZE, headers },
    );
  }
  if (slug) {
    const q = await getPublicQuiz(slug).catch(() => null);
    if (!q) return new Response("Not found", { status: 404 });
    return new ImageResponse(<ShareCard variant="story" avatar={q.avatar} nickname={q.nickname} title={q.title} size={q.size} />, {
      ...SIZE,
      headers,
    });
  }
  return new Response("Bad request", { status: 400 });
}
