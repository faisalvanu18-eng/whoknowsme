import { ImageResponse } from "next/og";
import { getPublicQuiz } from "@/lib/quiz-data";
import { FallbackCard, ShareCard } from "@/lib/og";

export const alt = "Friendship quiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = await getPublicQuiz(slug).catch(() => null);
  if (!quiz) return new ImageResponse(<FallbackCard />, size);
  return new ImageResponse(
    <ShareCard variant="og" avatar={quiz.avatar} nickname={quiz.nickname} title={quiz.title} size={quiz.size} />,
    size,
  );
}
