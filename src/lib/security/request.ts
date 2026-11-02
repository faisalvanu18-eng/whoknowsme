import "server-only";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";

/**
 * Client IP for rate limiting only. It is never stored or logged.
 * On Vercel, x-forwarded-for / x-real-ip are set by the platform and cannot be spoofed by clients.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

/** Basic CSRF defence for JSON POST endpoints: same-origin requests only. */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    if (host && o.host === host) return true;
    return o.origin === new URL(SITE_URL).origin;
  } catch {
    return false;
  }
}

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function readJson(req: Request, maxBytes = 32_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) throw new Error("payload_too_large");
  const text = await req.text();
  if (text.length > maxBytes) throw new Error("payload_too_large");
  return JSON.parse(text);
}
