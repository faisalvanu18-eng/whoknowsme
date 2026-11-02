import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { getAttemptReview, getResult, percentileFromHist } from "@/lib/quiz-data";
import { sha256Hex } from "@/lib/security/tokens";
import { emojiGrid, percentileText, tierFor } from "@/lib/scoring";
import { resultShareText, resultUrl } from "@/lib/share";
import { Avatar } from "@/components/avatar";
import { ScoreReveal } from "@/components/results/score-reveal";
import { ResultActions } from "@/components/results/result-actions";
import { AdSlot } from "@/components/ads/ad-slot";
import { ButtonLink } from "@/components/ui/button-link";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic"; // per-viewer: the answer review is gated by an httpOnly cookie

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = await getResult(id).catch(() => null);
  if (!r) return { title: "Result not found", robots: { index: false } };
  const tier = tierFor(r.score, r.total);
  const who = r.nickname || "A friend";
  const title = `${who} scored ${r.score}/${r.total} on ${r.quiz.nickname}'s quiz: ${tier.title}`;
  const description = `Think you know ${r.quiz.nickname} better? Take the quiz and beat ${r.score}/${r.total}.`;
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, siteName: SITE_NAME, url: `/result/${id}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await getResult(id);
  if (!r) notFound();

  const jar = await cookies();
  const key = jar.get(`wkr_${id.replace(/-/g, "")}`)?.value;
  const isOwner = Boolean(key && sha256Hex(key) === r.viewKeyHash);
  const review = isOwner ? await getAttemptReview(r.id, r.quizId) : null;

  const tier = tierFor(r.score, r.total);
  const { percentile, others } = percentileFromHist(r.quiz.hist, r.score, r.quiz.attempts);
  const grid = review ? emojiGrid(review.map((q) => q.isCorrect)) : "";

  if (!isOwner) {
    // Someone opened a shared result link: show the score and push them into the quiz / create flow.
    return (
      <div className="mx-auto max-w-lg px-4 pb-10 pt-8 text-center">
        <Avatar id={r.quiz.avatar} size={84} className="mx-auto" />
        <p className="mt-4 font-bold text-primary">
          {r.nickname || "A friend"} took {r.quiz.nickname}&apos;s quiz
        </p>
        <ScoreReveal score={r.score} total={r.total} confetti={false} />
        <p className="mt-2 text-2xl font-extrabold">
          {tier.emoji} {tier.title}
        </p>
        <p className="mt-6 text-lg font-bold">Think you know {r.quiz.nickname} better?</p>
        <ButtonLink href={`/quiz/${r.quiz.slug}?ref=${r.refCode}`} variant="gradient" size="xl" className="mt-3 w-full">
          Take {r.quiz.nickname}&apos;s quiz
        </ButtonLink>
        <ButtonLink href={`/create?source=result&ref=${r.refCode}`} variant="secondary" size="lg" className="mt-3 w-full">
          Make a quiz about me instead
        </ButtonLink>
      </div>
    );
  }

  const shareText = resultShareText({ creator: r.quiz.nickname, score: r.score, total: r.total, tier: tier.title, grid });

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-6">
      <section className="text-center" aria-labelledby="score-title">
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
          <Avatar id={r.quiz.avatar} size={28} /> {r.quiz.title}
        </div>
        <div className="mt-4">
          <ScoreReveal score={r.score} total={r.total} confetti={tier.confetti} />
        </div>
        <h1 id="score-title" className="animate-fade-up mt-3 text-3xl font-extrabold">
          {tier.emoji} {tier.title}
        </h1>
        <p className="mt-1 text-muted-foreground">{tier.line}</p>
        <p className="mt-3 inline-block rounded-full bg-muted px-4 py-2 text-sm font-bold">{percentileText(percentile, others)}</p>
        <pre aria-label="Emoji score grid" className="mt-4 font-sans text-2xl leading-tight tracking-widest">
          {grid}
        </pre>
      </section>

      <section className="mt-8" aria-label="What next">
        <ResultActions
          resultId={r.id}
          attemptRef={r.refCode}
          slug={r.quiz.slug}
          creator={r.quiz.nickname}
          quizRef={r.quiz.refCode}
          size={r.total}
          shareText={shareText}
          shareUrl={resultUrl(r.id, r.refCode)}
        />
      </section>

      {review && (
        <section className="mt-10" aria-labelledby="review-title">
          <h2 id="review-title" className="text-xl font-extrabold">
            Your answers
          </h2>
          <ol className="mt-3 space-y-3">
            {review.map((q, i) => (
              <li key={i} className={cn("rounded-2xl border-2 bg-card p-4", q.isCorrect ? "border-success/40" : "border-danger/40")}>
                <div className="flex items-start gap-2">
                  {q.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-label="Correct" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-label="Wrong" />
                  )}
                  <p className="font-bold">
                    {i + 1}. {q.text}
                  </p>
                </div>
                <div className="mt-2 pl-7 text-sm">
                  {q.isCorrect ? (
                    <p>
                      <span className="font-semibold text-success">{q.options[q.correctIndex]}</span>. Nailed it!
                    </p>
                  ) : (
                    <>
                      <p className="text-muted-foreground">
                        You said: <span className="line-through">{q.options[q.selectedIndex] ?? "-"}</span>
                      </p>
                      <p>
                        {r.quiz.nickname} said: <span className="font-semibold text-success">{q.options[q.correctIndex]}</span>
                      </p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Your answers are deleted automatically after 7 days. <Link href="/privacy" className="underline">Privacy</Link>
          </p>
        </section>
      )}

      <AdSlot placement="result_bottom" />

      <p className="mt-8 text-center text-sm">
        <Link href={`/quiz/${r.quiz.slug}`} className="font-semibold text-muted-foreground underline">
          Back to {r.quiz.nickname}&apos;s quiz
        </Link>
      </p>
    </div>
  );
}
