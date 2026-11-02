import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validations";
import { clientIp, isSameOrigin, jsonError, readJson } from "@/lib/security/request";
import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_COOKIE, adminConfigured, checkAdminPassword, createAdminSession } from "@/lib/security/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  if (!adminConfigured()) return jsonError(503, "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET.");
  const rl = await rateLimit("adminLogin", clientIp(req));
  if (!rl.success) return jsonError(429, "Too many attempts. Try again in 15 minutes.");

  let body: unknown;
  try {
    body = await readJson(req, 1_000);
  } catch {
    return jsonError(400, "Invalid request");
  }
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success || !checkAdminPassword(parsed.data.password)) {
    await new Promise((r) => setTimeout(r, 400)); // slow down guessing
    return jsonError(401, "Wrong password");
  }

  const session = createAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: session.maxAge,
  });
  return res;
}
