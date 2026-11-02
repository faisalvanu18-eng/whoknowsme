"use client";

import { useState } from "react";
import Link from "next/link";
import type { BankQuestion } from "@/data/question-bank";
import { track } from "@/lib/analytics/events";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/** Question of the day: one tap, no backend. Nudges into the create flow. */
export function DailyQuestion({ question }: { question: BankQuestion }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-3xl border-2 bg-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Question of the day</p>
      <h3 className="mt-2 text-xl font-extrabold">{question.text}</h3>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {question.options.map((o, i) => (
          <button
            key={o}
            type="button"
            onClick={() => {
              haptic();
              setPicked(i);
              track("daily_question_answered", { dim: question.id });
            }}
            aria-pressed={picked === i}
            className={cn(
              "min-h-12 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-[transform,border-color] active:scale-95",
              picked === i ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p className="animate-fade-up mt-4 text-sm">
          Would your friends guess <b>{question.options[picked]}</b>?{" "}
          <Link href="/create?template=quick-5" className="font-bold text-primary underline">
            Find out with a quiz →
          </Link>
        </p>
      )}
    </div>
  );
}
