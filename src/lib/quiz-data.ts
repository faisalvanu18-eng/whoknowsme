import "server-only";
import { cache } from "react";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { sha256Hex } from "@/lib/security/tokens";
import { slugSchema, dashboardTokenSchema } from "@/lib/validations";

/** What any visitor may see. Deliberately excludes correct answers and the token hash. */
export type PublicQuiz = {
  slug: string;
  title: string;
  nickname: string;
  avatar: string;
  size: number;
  pack: string;
  refCode: string;
  questions: { text: string; options: string[] }[];
};

type QuizRow = {
  id: string;
  slug: string;
  title: string;
  creator_nickname: string;
  avatar: string;
  pack: string;
  size: number;
  ref_code: string;
  status: string;
  expires_at: string | null;
};

function isLive(q: Pick<QuizRow, "status" | "expires_at">) {
  return q.status === "active" && (!q.expires_at || new Date(q.expires_at).getTime() > Date.now());
}

export const getPublicQuiz = cache(async (slug: string): Promise<PublicQuiz | null> => {
  if (!slugSchema.safeParse(slug).success || !isSupabaseConfigured()) return null;
  const { data, error } = await db()
    .from("quizzes")
    // explicit column list: correct_index is never selected for public payloads
    .select("id, slug, title, creator_nickname, avatar, pack, size, ref_code, status, expires_at, questions(position, text, options)")
    .eq("slug", slug)
    .order("position", { referencedTable: "questions", ascending: true })
    .maybeSingle();
  if (error) throw new Error(`getPublicQuiz: ${error.message}`);
  if (!data || !isLive(data as QuizRow)) return null;
  const row = data as QuizRow & { questions: { position: number; text: string; options: string[] }[] };
  return {
    slug: row.slug,
    title: row.title,
    nickname: row.creator_nickname,
    avatar: row.avatar,
    size: row.size,
    pack: row.pack,
    refCode: row.ref_code,
    questions: row.questions.map((q) => ({ text: q.text, options: q.options })),
  };
});

export type ResultData = {
  id: string;
  score: number;
  total: number;
  nickname: string | null;
  refCode: string;
  createdAt: string;
  quiz: { slug: string; title: string; nickname: string; avatar: string; refCode: string; attempts: number; hist: number[] };
};

export const getResult = cache(async (attemptId: string): Promise<(ResultData & { viewKeyHash: string; quizId: string }) | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(attemptId) || !isSupabaseConfigured()) return null;
  const { data, error } = await db()
    .from("attempts")
    .select("id, quiz_id, score, total, nickname, ref_code, view_key_hash, created_at, quizzes!inner(slug, title, creator_nickname, avatar, ref_code, status, expires_at, attempts_count, score_hist)")
    .eq("id", attemptId)
    .maybeSingle();
  if (error) throw new Error(`getResult: ${error.message}`);
  if (!data) return null;
  const q = (data as unknown as { quizzes: QuizRow & { attempts_count: number; score_hist: number[] } }).quizzes;
  if (!isLive(q)) return null;
  return {
    id: data.id,
    quizId: data.quiz_id,
    score: data.score,
    total: data.total,
    nickname: data.nickname,
    refCode: data.ref_code,
    createdAt: data.created_at,
    viewKeyHash: data.view_key_hash,
    quiz: { slug: q.slug, title: q.title, nickname: q.creator_nickname, avatar: q.avatar, refCode: q.ref_code, attempts: q.attempts_count, hist: q.score_hist },
  };
});

/** Answer review: only called after the viewer proved they own the attempt (cookie key). */
export async function getAttemptReview(attemptId: string, quizId: string) {
  const [{ data: questions, error: e1 }, { data: responses, error: e2 }] = await Promise.all([
    db().from("questions").select("id, position, text, options, correct_index").eq("quiz_id", quizId).order("position"),
    db().from("responses").select("question_id, selected_index, is_correct").eq("attempt_id", attemptId),
  ]);
  if (e1 || e2) throw new Error(`getAttemptReview: ${(e1 || e2)!.message}`);
  const byQ = new Map((responses ?? []).map((r) => [r.question_id, r]));
  return (questions ?? []).map((q) => {
    const r = byQ.get(q.id);
    return {
      text: q.text as string,
      options: q.options as string[],
      correctIndex: q.correct_index as number,
      selectedIndex: (r?.selected_index ?? -1) as number,
      isCorrect: Boolean(r?.is_correct),
    };
  });
}

export function percentileFromHist(hist: number[], score: number, attempts: number) {
  const others = Math.max(attempts - 1, 0);
  if (others === 0) return { percentile: null, others };
  const below = hist.slice(0, score).reduce((a, b) => a + (b || 0), 0);
  return { percentile: Math.round((100 * below) / others), others };
}

export type DashboardData = {
  slug: string;
  title: string;
  nickname: string;
  avatar: string;
  size: number;
  refCode: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
  attempts: number;
  average: number;
  best: number;
  shares: number;
  lastAttemptAt: string | null;
  leaderboard: { id: string; nickname: string | null; score: number; total: number; createdAt: string }[];
  page: number;
  pageSize: number;
  recentTotal: number;
};

export async function getDashboard(token: string, page = 1, pageSize = 20): Promise<DashboardData | null> {
  if (!dashboardTokenSchema.safeParse(token).success || !isSupabaseConfigured()) return null;
  const { data: quiz, error } = await db()
    .from("quizzes")
    .select("id, slug, title, creator_nickname, avatar, size, ref_code, status, created_at, expires_at, attempts_count, score_sum, best_score, share_count, last_attempt_at")
    .eq("token_hash", sha256Hex(token))
    .maybeSingle();
  if (error) throw new Error(`getDashboard: ${error.message}`);
  if (!quiz) return null;

  const from = (page - 1) * pageSize;
  const { data: rows, count, error: e2 } = await db()
    .from("attempts")
    .select("id, nickname, score, total, created_at", { count: "exact" })
    .eq("quiz_id", quiz.id)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .range(from, from + pageSize - 1);
  if (e2) throw new Error(`getDashboard attempts: ${e2.message}`);

  return {
    slug: quiz.slug,
    title: quiz.title,
    nickname: quiz.creator_nickname,
    avatar: quiz.avatar,
    size: quiz.size,
    refCode: quiz.ref_code,
    status: quiz.status,
    createdAt: quiz.created_at,
    expiresAt: quiz.expires_at,
    attempts: quiz.attempts_count,
    average: quiz.attempts_count ? Math.round((quiz.score_sum / quiz.attempts_count) * 10) / 10 : 0,
    best: quiz.best_score,
    shares: quiz.share_count,
    lastAttemptAt: quiz.last_attempt_at,
    leaderboard: (rows ?? []).map((r) => ({ id: r.id, nickname: r.nickname, score: r.score, total: r.total, createdAt: r.created_at })),
    page,
    pageSize,
    recentTotal: count ?? 0,
  };
}
