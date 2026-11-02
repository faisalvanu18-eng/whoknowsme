import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicQuiz } from "@/lib/quiz-data";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { SITE_NAME } from "@/lib/site";

/**
 * Quiz pages are ISR: rendered on first request, cached at the edge, refreshed every 5 minutes
 * (and immediately via revalidatePath when the creator deletes or a moderator disables it).
 * The payload never contains correct answers. No ads and noindex (user-generated content).
 */
export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const quiz = await getPublicQuiz(slug).catch(() => null);
  if (!quiz) return { title: "Quiz not found", robots: { index: false, follow: false } };
  const title = `${quiz.title} 👀`;
  const description = `${quiz.nickname} made a ${quiz.size}-question quiz. Think you know them? Bet you can't score ${quiz.size}/${quiz.size}.`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, type: "website", siteName: SITE_NAME, url: `/quiz/${slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = await getPublicQuiz(slug);
  if (!quiz) notFound();
  return <QuizPlayer quiz={quiz} />;
}
