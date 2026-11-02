import { ImageResponse } from "next/og";
import { getResult } from "@/lib/quiz-data";
import { FallbackCard, ShareCard } from "@/lib/og";
import { tierFor } from "@/lib/scoring";

export const alt = "Friendship quiz result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getResult(id).catch(() => null);
  if (!r) return new ImageResponse(<FallbackCard />, size);
  return new ImageResponse(
    <ShareCard
      variant="og"
      avatar={r.quiz.avatar}
      nickname={r.quiz.nickname}
      title={r.quiz.title}
      score={{ score: r.score, total: r.total, tier: tierFor(r.score, r.total).title, friend: r.nickname }}
    />,
    size,
  );
}
