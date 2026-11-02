"use client";

/**
 * "My quizzes on this device" + play history. Stored only in this browser's localStorage.
 * Losing it (clearing data, in-app browser) loses dashboard access, which is why the UI keeps
 * nudging creators to save their private dashboard link.
 */

export type MyQuiz = { slug: string; token: string; title: string; avatar: string; createdAt: string };
export type PlayedQuiz = { resultId: string; slug: string; title: string; creator: string; score: number; total: number; playedAt: string };

const QUIZZES = "wk_my_quizzes";
const PLAYED = "wk_played";

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? (JSON.parse(raw) as T[]) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage full or disabled */
  }
}

export function getMyQuizzes() {
  return read<MyQuiz>(QUIZZES);
}

export function saveMyQuiz(q: MyQuiz) {
  const list = getMyQuizzes().filter((x) => x.slug !== q.slug);
  write(QUIZZES, [q, ...list].slice(0, 50));
}

export function removeMyQuiz(slug: string) {
  write(QUIZZES, getMyQuizzes().filter((x) => x.slug !== slug));
}

export function getPlayed() {
  return read<PlayedQuiz>(PLAYED);
}

export function savePlayed(p: PlayedQuiz) {
  const list = getPlayed().filter((x) => x.resultId !== p.resultId);
  write(PLAYED, [p, ...list].slice(0, 50));
}

/** Remembers the ?ref= code that brought this device here (first touch, 7 days). */
export function rememberRef(ref: string | null) {
  if (!ref || !/^[a-z0-9]{6,10}$/.test(ref)) return;
  try {
    const existing = JSON.parse(localStorage.getItem("wk_ref") || "null") as { ref: string; ts: number } | null;
    if (existing && Date.now() - existing.ts < 7 * 864e5) return;
    localStorage.setItem("wk_ref", JSON.stringify({ ref, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function getRememberedRef(): string | undefined {
  try {
    const v = JSON.parse(localStorage.getItem("wk_ref") || "null") as { ref: string; ts: number } | null;
    if (v && Date.now() - v.ts < 7 * 864e5) return v.ref;
  } catch {
    /* ignore */
  }
  return undefined;
}

export function getOrCreate(key: string, make: () => string) {
  try {
    const v = sessionStorage.getItem(key);
    if (v) return v;
    const n = make();
    sessionStorage.setItem(key, n);
    return n;
  } catch {
    return make();
  }
}
