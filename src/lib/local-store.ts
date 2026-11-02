"use client";

/**
 * Device-local storage.
 *
 *  - "My quizzes on this device" (contains the PRIVATE dashboard tokens) lives in an httpOnly
 *    cookie via /api/mine, so no script on the page (including ad scripts) can read it.
 *    Older versions kept it in localStorage; it is migrated to the cookie and removed on first load.
 *  - Play history (result ids + scores, nothing secret) stays in localStorage.
 *
 * Losing these (clearing site data, in-app browser) loses dashboard access, which is why the UI
 * keeps nudging creators to save their private dashboard link.
 */

export type MyQuiz = { slug: string; token: string; title: string; avatar: string; createdAt: string };
export type PlayedQuiz = { resultId: string; slug: string; title: string; creator: string; score: number; total: number; playedAt: string };

const LEGACY_QUIZZES = "wk_my_quizzes";
const PLAYED = "wk_played";
/** Non-secret flag: "this device has saved quizzes", so visitors without any skip the API call. */
const HAS_MINE = "wk_has_mine";

function hasMine() {
  try {
    return localStorage.getItem(HAS_MINE) === "1" || localStorage.getItem(LEGACY_QUIZZES) !== null;
  } catch {
    return true;
  }
}

function markMine() {
  try {
    localStorage.setItem(HAS_MINE, "1");
  } catch {
    /* ignore */
  }
}

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

async function postMine(items: { slug: string; token: string; createdAt?: string }[]) {
  const res = await fetch("/api/mine", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ items }),
    credentials: "same-origin",
  }).catch(() => null);
  if (res?.ok) markMine();
  return Boolean(res?.ok);
}

/** Moves tokens from the old localStorage key into the httpOnly cookie, then deletes them. */
async function migrateLegacy() {
  const legacy = read<MyQuiz>(LEGACY_QUIZZES);
  if (!legacy.length) return;
  const ok = await postMine(legacy.slice(0, 25).map((q) => ({ slug: q.slug, token: q.token, createdAt: q.createdAt })));
  if (ok) {
    try {
      localStorage.removeItem(LEGACY_QUIZZES);
    } catch {
      /* ignore */
    }
  }
}

export async function getMyQuizzes(): Promise<MyQuiz[]> {
  if (!hasMine()) return [];
  await migrateLegacy();
  const res = await fetch("/api/mine", { credentials: "same-origin", cache: "no-store" }).catch(() => null);
  const data = (await res?.json().catch(() => null)) as { quizzes?: MyQuiz[] } | null;
  return Array.isArray(data?.quizzes) ? data.quizzes : [];
}

export async function saveMyQuiz(q: MyQuiz) {
  await postMine([{ slug: q.slug, token: q.token, createdAt: q.createdAt }]);
}

export async function removeMyQuiz(slug: string) {
  await fetch(`/api/mine?slug=${encodeURIComponent(slug)}`, { method: "DELETE", credentials: "same-origin" }).catch(() => null);
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
