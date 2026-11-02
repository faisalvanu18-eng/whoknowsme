import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { db, isSupabaseConfigured } from "@/lib/supabase/server";
import { dashboardTokenSchema, slugSchema } from "@/lib/validations";
import { isSameOrigin, jsonError, readJson } from "@/lib/security/request";

export const runtime = "nodejs";

/**
 * "My quizzes on this device", stored in an httpOnly cookie instead of localStorage.
 *
 * Why: the private dashboard tokens are secrets. Third-party scripts on the page (ads) can read
 * localStorage, but they can NOT read an httpOnly cookie. The cookie is scoped to /api/mine, so it
 * is only sent to this endpoint (not on every page request).
 *
 * Format (compact so ~25 quizzes fit in one 4KB cookie): "slug.token.createdBase36|slug.token.created..."
 * Titles/avatars are looked up from the database (public info) when listing.
 */
const COOKIE = "wk_mine";
const MAX = 25;

type Entry = { slug: string; token: string; created: number };

function parse(raw: string | undefined): Entry[] {
  if (!raw) return [];
  const out: Entry[] = [];
  for (const part of raw.split("|")) {
    const [slug, token, created] = part.split(".");
    if (slugSchema.safeParse(slug).success && dashboardTokenSchema.safeParse(token).success && /^[0-9a-z]{1,12}$/.test(created ?? "")) {
      out.push({ slug, token, created: parseInt(created, 36) });
    }
  }
  return out.slice(0, MAX);
}

function serialize(list: Entry[]) {
  return list
    .slice(0, MAX)
    .map((e) => `${e.slug}.${e.token}.${e.created.toString(36)}`)
    .join("|");
}

function withCookie(res: NextResponse, list: Entry[]) {
  res.cookies.set(COOKIE, serialize(list), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/mine",
    maxAge: 60 * 60 * 24 * 400, // browsers cap cookies at ~400 days
  });
  return res;
}

async function current() {
  return parse((await cookies()).get(COOKIE)?.value);
}

export async function GET() {
  const list = await current();
  if (!list.length) return NextResponse.json({ ok: true, quizzes: [] }, { headers: { "Cache-Control": "private, no-store" } });

  let meta = new Map<string, { title: string; avatar: string }>();
  if (isSupabaseConfigured()) {
    const { data } = await db().from("quizzes").select("slug, title, avatar").in("slug", list.map((e) => e.slug));
    meta = new Map((data ?? []).map((q) => [q.slug as string, { title: q.title as string, avatar: q.avatar as string }]));
  }
  // Drop quizzes that no longer exist (deleted / expired), keep the cookie tidy.
  const alive = isSupabaseConfigured() ? list.filter((e) => meta.has(e.slug)) : list;
  const quizzes = alive.map((e) => ({
    slug: e.slug,
    token: e.token,
    title: meta.get(e.slug)?.title ?? "My quiz",
    avatar: meta.get(e.slug)?.avatar ?? "fox-violet",
    createdAt: new Date(e.created).toISOString(),
  }));
  const res = NextResponse.json({ ok: true, quizzes }, { headers: { "Cache-Control": "private, no-store" } });
  return alive.length !== list.length ? withCookie(res, alive) : res;
}

const addSchema = z.object({
  items: z
    .array(z.object({ slug: slugSchema, token: dashboardTokenSchema, createdAt: z.string().max(40).optional() }))
    .min(1)
    .max(MAX),
});

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  let body: unknown;
  try {
    body = await readJson(req, 8_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "Invalid request");

  let list = await current();
  for (const it of parsed.data.items) {
    const created = Date.parse(it.createdAt ?? "") || Date.now();
    list = [{ slug: it.slug, token: it.token, created }, ...list.filter((e) => e.slug !== it.slug)];
  }
  list.sort((a, b) => b.created - a.created);
  return withCookie(NextResponse.json({ ok: true }), list);
}

export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!slugSchema.safeParse(slug).success) return jsonError(400, "Invalid request");
  const list = (await current()).filter((e) => e.slug !== slug);
  return withCookie(NextResponse.json({ ok: true }), list);
}
