import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/security/admin-auth";
import { isSameOrigin, jsonError } from "@/lib/security/request";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return jsonError(403, "forbidden");
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
