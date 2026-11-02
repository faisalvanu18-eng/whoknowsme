import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { getPublicQuiz, getResult } from "@/lib/quiz-data";
import { ShareCard } from "@/lib/og";
import { tierFor } from "@/lib/scoring";
import { quizUrl } from "@/lib/share";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/security/request";

export const runtime = "nodejs";

const SIZE = { width: 1080, height: 1920 };

/**
 * QR code + readable link for the image. Snapchat (and Instagram) drop any text shared together
 * with a photo, so the link has to live INSIDE the picture: friends scan it with the Snapchat
 * camera (or press and hold the snap) and land on the quiz.
 */
async function linkBits(target: string) {
  const qr = await QRCode.toDataURL(target, { margin: 1, width: 520, errorCorrectionLevel: "M", color: { dark: "#1C1838", light: "#FFFFFF" } });
  return { qr, link: target.replace(/^https?:\/\//, "") };
}

/** Story / Snapchat image (9:16). ?quiz=<slug> or ?result=<attemptId>. */
export async function GET(req: Request) {
  const rl = await rateLimit("storyImage", clientIp(req));
  if (!rl.success) return new Response("Too many requests", { status: 429 });

  const url = new URL(req.url);
  const slug = url.searchParams.get("quiz");
  const resultId = url.searchParams.get("result");
  const headers = { "Cache-Control": "public, max-age=3600, s-maxage=86400", "Content-Disposition": 'inline; filename="who-knows-me.png"' };

  if (resultId) {
    const r = await getResult(resultId).catch(() => null);
    if (!r) return new Response("Not found", { status: 404 });
    // Friends who scan a result image go straight to the quiz; the attempt's ref keeps attribution.
    const { qr, link } = await linkBits(quizUrl(r.quiz.slug, r.refCode));
    return new ImageResponse(
      <ShareCard
        variant="story"
        avatar={r.quiz.avatar}
        nickname={r.quiz.nickname}
        title={r.quiz.title}
        score={{ score: r.score, total: r.total, tier: tierFor(r.score, r.total).title, friend: r.nickname }}
        qr={qr}
        link={link}
      />,
      { ...SIZE, headers },
    );
  }
  if (slug) {
    const q = await getPublicQuiz(slug).catch(() => null);
    if (!q) return new Response("Not found", { status: 404 });
    const { qr, link } = await linkBits(quizUrl(q.slug, q.refCode));
    return new ImageResponse(
      <ShareCard variant="story" avatar={q.avatar} nickname={q.nickname} title={q.title} size={q.size} qr={qr} link={link} />,
      { ...SIZE, headers },
    );
  }
  return new Response("Bad request", { status: 400 });
}
