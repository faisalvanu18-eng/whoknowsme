"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Plus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { ButtonLink } from "@/components/ui/button-link";
import { getMyQuizzes, getPlayed, type MyQuiz, type PlayedQuiz } from "@/lib/local-store";
import { formatRelative } from "@/lib/utils";

export function MyQuizzes({ compact = false }: { compact?: boolean }) {
  const [mine, setMine] = useState<MyQuiz[] | null>(null);
  const [played, setPlayed] = useState<PlayedQuiz[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    setMine(getMyQuizzes());
    setPlayed(getPlayed());
  }, []);

  if (mine === null) return compact ? null : <div className="h-40" aria-busy="true" />;

  if (compact) {
    if (!mine.length) return null;
    return (
      <div className="rounded-2xl border-2 bg-card p-4">
        <p className="text-sm font-extrabold">Your quizzes on this device</p>
        <ul className="mt-2 space-y-1">
          {mine.slice(0, 3).map((q) => (
            <li key={q.slug}>
              <Link href={`/dashboard/${q.token}`} className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-muted">
                <Avatar id={q.avatar} size={28} />
                <span className="flex-1 truncate text-sm font-semibold">{q.title}</span>
                <BarChart3 className="size-4 text-primary" aria-label="See results" />
              </Link>
            </li>
          ))}
        </ul>
        {mine.length > 3 && (
          <Link href="/me" className="mt-1 block text-sm font-semibold text-primary">
            See all {mine.length}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-extrabold">Quizzes I made</h2>
        {mine.length === 0 ? (
          <div className="mt-3 rounded-2xl border-2 border-dashed p-6 text-center">
            <p className="text-muted-foreground">No quizzes on this device yet.</p>
            <ButtonLink href="/create" className="mt-4">
              <Plus aria-hidden /> Make one in 30 seconds
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {mine.map((q) => (
              <li key={q.slug}>
                <Link href={`/dashboard/${q.token}`} className="flex min-h-16 items-center gap-3 rounded-2xl border-2 bg-card p-3 hover:border-primary/60">
                  <Avatar id={q.avatar} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{q.title}</span>
                    <span className="text-xs text-muted-foreground">Created {formatRelative(q.createdAt)}</span>
                  </span>
                  <span className="text-sm font-bold text-primary">Results →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-extrabold">Quizzes I played</h2>
        {played.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nothing yet. Results disappear after 7 days.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {played.map((p) => (
              <li key={p.resultId}>
                <Link href={`/result/${p.resultId}`} className="flex min-h-14 items-center gap-3 rounded-2xl border bg-card p-3 hover:border-primary/60">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {p.creator} · {formatRelative(p.playedAt)}
                    </span>
                  </span>
                  <span className="font-extrabold tabular-nums text-primary">
                    {p.score}/{p.total}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
