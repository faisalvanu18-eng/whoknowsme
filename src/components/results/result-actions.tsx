"use client";

import Link from "next/link";
import { RotateCcw, Sparkles, Swords } from "lucide-react";
import { ShareKit } from "@/components/results/share-kit";
import { track } from "@/lib/analytics/events";
import { haptic } from "@/lib/haptics";

type Props = {
  resultId: string;
  attemptRef: string;
  slug: string;
  creator: string;
  quizRef: string;
  shareText: string;
  shareUrl: string;
  size: number;
};

function templateForSize(size: number) {
  return size <= 5 ? "quick-5" : size >= 15 ? "ultimate-15" : "best-friends-10";
}

/**
 * Viral loop actions, in priority order:
 *  1. Apna quiz banao (largest)  2. Share my result  3. Try again
 * Both create links prefill a fresh question set so a friend is answering within seconds.
 */
export function ResultActions({ resultId, attemptRef, slug, creator, quizRef, shareText, shareUrl, size }: Props) {
  const seed = resultId.replace(/\D/g, "").slice(0, 8) || "1";
  const createHref = `/create?source=result&ref=${attemptRef}&template=${templateForSize(size)}&seed=${seed}`;
  const challengeHref = `/create?source=challenge&ref=${attemptRef}&template=${templateForSize(size)}&seed=${Number(seed) + 7}&for=${encodeURIComponent(creator)}`;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-brand-gradient p-1 shadow-xl shadow-primary/30">
        <Link
          href={createHref}
          onClick={() => {
            haptic();
            track("create_from_result", { dim: "result_cta", slug });
          }}
          className="flex min-h-20 flex-col items-center justify-center rounded-[1.3rem] px-5 py-4 text-center text-white transition-transform active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 text-xl font-extrabold">
            <Sparkles className="size-6" aria-hidden /> Apna quiz banao
          </span>
          <span className="text-sm font-semibold opacity-90">Dekho tumhe kaun jaanta hai · 30 second</span>
        </Link>
      </div>

      <div>
        <p className="mb-2 text-center text-sm font-bold text-muted-foreground">Dosto ko dikhao 👇</p>
        <ShareKit url={shareUrl} text={shareText} kind="result" slug={slug} storyImageUrl={`/api/story?result=${resultId}`} compact />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/quiz/${slug}?ref=${quizRef}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 font-bold hover:border-primary/60"
        >
          <RotateCcw className="size-5" aria-hidden /> Phir khelo
        </Link>
        <Link
          href={challengeHref}
          onClick={() => track("create_from_result", { dim: "challenge_back", slug })}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 font-bold hover:border-primary/60"
        >
          <Swords className="size-5" aria-hidden /> Challenge wapas
        </Link>
      </div>
    </div>
  );
}
