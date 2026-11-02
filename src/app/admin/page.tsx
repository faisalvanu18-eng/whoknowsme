import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin, adminConfigured } from "@/lib/security/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getAdminStats } from "@/lib/admin-stats";
import { AdminLogin, LogoutButton, ModerationActions } from "@/components/admin/admin-client";
import { BarChart, Funnel, HBarList } from "@/components/admin/charts";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!adminConfigured()) {
    return (
      <div className="mx-auto mt-16 max-w-md px-4 text-center">
        <h1 className="text-2xl font-extrabold">Admin is disabled</h1>
        <p className="mt-2 text-muted-foreground">Set ADMIN_PASSWORD (16+ chars) and ADMIN_SESSION_SECRET (32+ chars) to enable it.</p>
      </div>
    );
  }
  if (!(await isAdmin())) return <AdminLogin />;
  if (!isSupabaseConfigured()) return <p className="p-8">Supabase is not configured.</p>;

  const { days: daysParam } = await searchParams;
  const days = [7, 30, 90].includes(Number(daysParam)) ? Number(daysParam) : 30;
  const s = await getAdminStats(days);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold">Admin</h1>
        <div className="flex items-center gap-1">
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/admin?days=${d}`}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold ${d === days ? "bg-primary text-white" : "hover:bg-muted"}`}
            >
              {d}d
            </Link>
          ))}
          <LogoutButton />
        </div>
      </header>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Visitors (daily uniques, summed)" value={s.totals.visitors} />
        <Kpi label="Quizzes created" value={s.totals.published} sub={`${s.totals.allTimeQuizzes.toLocaleString()} live in DB`} />
        <Kpi label="Attempts completed" value={s.totals.completed} sub={`${s.totals.liveAttempts.toLocaleString()} stored (7-day window)`} />
        <Kpi label="Completion rate" value={pct(s.rates.completion)} sub={`Start rate ${pct(s.rates.startRate)}`} />
        <Kpi label="Viral coefficient (K)" value={s.rates.viralK.toFixed(3)} sub="quizzes from result CTAs ÷ completions" />
        <Kpi label="Referral K" value={s.rates.referralK.toFixed(3)} sub={`${s.totals.referredQuizzes} quizzes via ?ref`} />
        <Kpi label="Result share rate" value={pct(s.rates.shareAfterResult)} sub="result shares ÷ completions" />
        <Kpi label="Creator shares / quiz" value={s.rates.creatorShare.toFixed(2)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <BarChart label="Visitors" data={s.series.visitors} />
        <BarChart label="Quizzes created" data={s.series.published} color="var(--blue)" />
        <BarChart label="Attempts completed" data={s.series.completed} color="#EC4899" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Funnel steps={s.funnel} />
        <div className="rounded-2xl border bg-card p-4">
          <p className="font-bold">Weekly totals</p>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="py-1">Week of</th>
                <th>Visitors</th>
                <th>Quizzes</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {s.weekly.visitors.map((w, i) => (
                <tr key={w.week} className="border-t">
                  <td className="py-1.5">{w.week}</td>
                  <td className="tabular-nums">{w.value}</td>
                  <td className="tabular-nums">{s.weekly.published[i]?.value ?? 0}</td>
                  <td className="tabular-nums">{s.weekly.completed[i]?.value ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HBarList title="Creator shares by channel" items={s.shareByChannel} />
        <HBarList title="Result shares by channel" items={s.resultShareByChannel} />
        <HBarList title="Top question categories" items={s.categories} />
        <HBarList title="Quiz sizes" items={s.sizes} />
        <HBarList title="Score distribution (% bucket)" items={s.scoreDistribution} />
        <HBarList title="Ad slot views by placement" items={s.adsByPlacement} />
      </section>

      <section aria-labelledby="reports" className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between p-4">
          <h2 id="reports" className="text-xl font-extrabold">
            Moderation queue
          </h2>
          <span className="text-sm text-muted-foreground">{s.reports.length} open</span>
        </div>
        {s.reports.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted-foreground">Nothing to review. 🎉</p>
        ) : (
          <ul className="divide-y">
            {s.reports.map((r) => (
              <li key={r.id} className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <a href={`/quiz/${r.slug}`} target="_blank" rel="noreferrer" className="underline">
                        /quiz/{r.slug}
                      </a>{" "}
                      · {r.reason} · {formatRelative(r.createdAt)} · quiz {r.quizStatus} · {r.attempts} attempts
                    </p>
                  </div>
                  <ModerationActions reportId={r.id} slug={r.slug} status={r.quizStatus} />
                </div>
                {r.details && <p className="rounded-xl bg-muted p-3 text-sm">{r.details}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <p className="text-2xl font-extrabold tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
