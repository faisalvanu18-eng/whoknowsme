import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Crown, Medal } from "lucide-react";
import { getDashboard } from "@/lib/quiz-data";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/ui/misc";
import { DangerZone, DashboardNudge, RememberDevice } from "@/components/dashboard/dashboard-client";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your quiz results",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { token } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.min(500, Number(pageParam) || 1));
  const d = await getDashboard(token, page);
  if (!d) notFound();

  const props = {
    token,
    slug: d.slug,
    title: d.title,
    avatar: d.avatar,
    nickname: d.nickname,
    size: d.size,
    refCode: d.refCode,
    createdAt: d.createdAt,
    attempts: d.attempts,
  };
  const pages = Math.max(1, Math.ceil(d.recentTotal / d.pageSize));

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 pb-12 pt-6">
      <header className="flex items-center gap-4">
        <Avatar id={d.avatar} size={64} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-primary">Your private results</p>
          <h1 className="truncate text-2xl font-extrabold">{d.title}</h1>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge>{d.size} questions</Badge>
            {d.status !== "active" && <Badge tone="danger">Hidden by moderators</Badge>}
            <Link href={`/quiz/${d.slug}`} className="text-xs font-semibold text-muted-foreground underline">
              View quiz
            </Link>
          </div>
        </div>
      </header>

      <section aria-label="Stats" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Friends played" value={d.attempts} />
        <Stat label="Average score" value={d.attempts ? `${d.average}/${d.size}` : "–"} />
        <Stat label="Highest score" value={d.attempts ? `${d.best}/${d.size}` : "–"} />
        <Stat label="Shares" value={d.shares} />
      </section>

      <DashboardNudge {...props} />

      <section aria-labelledby="lb-title" className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 id="lb-title" className="text-lg font-extrabold">
            Leaderboard
          </h2>
          <span className="text-xs text-muted-foreground">Last 7 days · only you can see this</span>
        </div>
        {d.leaderboard.length === 0 ? (
          <p className="p-4 pt-2 text-sm text-muted-foreground">No scores yet. Share your link and check back soon!</p>
        ) : (
          <ol className="divide-y">
            {d.leaderboard.map((row, i) => {
              const rank = (d.page - 1) * d.pageSize + i + 1;
              return (
                <li key={row.id} className="flex min-h-14 items-center gap-3 px-4 py-2">
                  <span className="flex w-8 justify-center font-extrabold text-muted-foreground">
                    {rank === 1 ? <Crown className="size-5 text-amber-500" aria-label="1st" /> : rank <= 3 ? <Medal className="size-5 text-primary" aria-label={`${rank}`} /> : rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{row.nickname || "Anonymous friend"}</span>
                  <span className="text-xs text-muted-foreground">{formatRelative(row.createdAt)}</span>
                  <span className="w-14 text-right font-extrabold tabular-nums text-primary">
                    {row.score}/{row.total}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {pages > 1 && (
          <nav aria-label="Leaderboard pages" className="flex items-center justify-between border-t p-2">
            <PageLink token={token} page={d.page - 1} disabled={d.page <= 1}>
              <ChevronLeft className="size-4" /> Prev
            </PageLink>
            <span className="text-sm text-muted-foreground">
              Page {d.page} of {pages}
            </span>
            <PageLink token={token} page={d.page + 1} disabled={d.page >= pages}>
              Next <ChevronRight className="size-4" />
            </PageLink>
          </nav>
        )}
      </section>

      <RememberDevice {...props} />
      <DangerZone token={token} slug={d.slug} expiresAt={d.expiresAt} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

function PageLink({ token, page, disabled, children }: { token: string; page: number; disabled: boolean; children: React.ReactNode }) {
  if (disabled) return <span className="inline-flex min-h-11 items-center gap-1 px-3 text-sm opacity-40">{children}</span>;
  return (
    <Link href={`/dashboard/${token}?page=${page}`} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold hover:bg-muted">
      {children}
    </Link>
  );
}
