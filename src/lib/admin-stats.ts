import "server-only";
import { db } from "@/lib/supabase/server";

type Row = { day: string; metric: string; dimension: string; count: number };

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getAdminStats(days = 30) {
  const since = new Date(Date.now() - (days - 1) * 864e5);
  const sinceDay = isoDay(since);

  const [statsRes, quizTotal, liveAttempts, referredQuizzes, reportsRes] = await Promise.all([
    db().from("daily_stats").select("day, metric, dimension, count").gte("day", sinceDay).limit(20000),
    db().from("quizzes").select("id", { count: "exact", head: true }),
    db().from("attempts").select("id", { count: "exact", head: true }),
    db().from("quizzes").select("id", { count: "exact", head: true }).not("referred_by", "is", null).gte("created_at", since.toISOString()),
    db()
      .from("reports")
      .select("id, quiz_slug, title_snapshot, reason, details, created_at, quiz_id, quizzes(status, attempts_count)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (statsRes.error) throw new Error(statsRes.error.message);

  const rows = (statsRes.data ?? []) as Row[];
  const sum = (metric: string, dim?: string) =>
    rows.filter((r) => r.metric === metric && (dim === undefined || r.dimension === dim)).reduce((a, r) => a + Number(r.count), 0);
  const byDim = (metric: string) => {
    const m = new Map<string, number>();
    for (const r of rows) if (r.metric === metric) m.set(r.dimension || "(none)", (m.get(r.dimension || "(none)") ?? 0) + Number(r.count));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const dayList: string[] = [];
  for (let i = 0; i < days; i++) dayList.push(isoDay(new Date(since.getTime() + i * 864e5)));
  const series = (metric: string) => dayList.map((d) => ({ day: d, value: rows.filter((r) => r.day === d && r.metric === metric).reduce((a, r) => a + Number(r.count), 0) }));

  const weekly = (metric: string) => {
    const s = series(metric);
    const out: { week: string; value: number }[] = [];
    for (let i = 0; i < s.length; i += 7) out.push({ week: s[i].day, value: s.slice(i, i + 7).reduce((a, x) => a + x.value, 0) });
    return out;
  };

  const opened = sum("quiz_opened");
  const started = sum("quiz_started");
  const completed = sum("quiz_completed");
  const resultShared = sum("result_shared");
  const quizShared = sum("share");
  const createdFromResult = sum("create_from_result");
  const published = sum("quiz_published");

  return {
    days,
    totals: {
      visitors: sum("visit"),
      published,
      completed,
      allTimeQuizzes: quizTotal.count ?? 0,
      liveAttempts: liveAttempts.count ?? 0,
      referredQuizzes: referredQuizzes.count ?? 0,
      reportsSubmitted: sum("report_submitted"),
      adViews: sum("ad_slot_viewed"),
      dailyQuestion: sum("daily_question_answered"),
    },
    rates: {
      completion: started ? completed / started : 0,
      startRate: opened ? started / opened : 0,
      shareAfterResult: completed ? resultShared / completed : 0,
      creatorShare: published ? quizShared / published : 0,
      // Viral coefficient: new quizzes created from result/challenge CTAs per completed attempt.
      viralK: completed ? createdFromResult / completed : 0,
      // Broader K: any quiz whose creator arrived through a ?ref link, per completed attempt.
      referralK: completed ? (referredQuizzes.count ?? 0) / completed : 0,
    },
    funnel: [
      { label: "Quiz opened", value: opened },
      { label: "Started", value: started },
      { label: "Completed", value: completed },
      { label: "Shared result", value: resultShared },
      { label: "Created own quiz", value: createdFromResult },
    ],
    shareByChannel: byDim("share"),
    resultShareByChannel: byDim("result_shared"),
    categories: byDim("category").slice(0, 10),
    sizes: byDim("quiz_size"),
    scoreDistribution: byDim("score_pct").sort((a, b) => Number(a[0]) - Number(b[0])),
    adsByPlacement: byDim("ad_slot_viewed"),
    series: {
      visitors: series("visit"),
      published: series("quiz_published"),
      completed: series("quiz_completed"),
    },
    weekly: {
      visitors: weekly("visit"),
      published: weekly("quiz_published"),
      completed: weekly("quiz_completed"),
    },
    reports: (reportsRes.data ?? []).map((r) => {
      const q = r.quizzes as unknown as { status: string; attempts_count: number } | null;
      return {
        id: r.id as string,
        slug: r.quiz_slug as string,
        title: r.title_snapshot as string,
        reason: r.reason as string,
        details: (r.details as string | null) ?? null,
        createdAt: r.created_at as string,
        quizStatus: q?.status ?? "deleted",
        attempts: q?.attempts_count ?? 0,
      };
    }),
  };
}
