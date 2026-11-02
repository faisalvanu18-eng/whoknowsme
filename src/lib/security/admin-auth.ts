import "server-only";
import { cookies } from "next/headers";
import { hmac, safeEqual } from "@/lib/security/tokens";

/**
 * Secret-based admin login. One strong password (ADMIN_PASSWORD) unlocks a signed, httpOnly,
 * 12-hour session cookie. Login attempts are rate limited in the route handler.
 * Admin is disabled entirely unless both env vars are set with sufficient length.
 */
export const ADMIN_COOKIE = "wk_admin";
const SESSION_SECONDS = 12 * 60 * 60;

function secrets() {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  if (password.length < 16 || secret.length < 32) return null;
  return { password, secret };
}

export function adminConfigured() {
  return secrets() !== null;
}

export function checkAdminPassword(input: string) {
  const s = secrets();
  if (!s) return false;
  return safeEqual(input, s.password);
}

export function createAdminSession() {
  const s = secrets();
  if (!s) throw new Error("admin_not_configured");
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return { value: `${exp}.${hmac(s.secret, `admin.${exp}`)}`, maxAge: SESSION_SECONDS };
}

export function verifyAdminSession(value: string | undefined) {
  const s = secrets();
  if (!s || !value) return false;
  const [expStr, sig] = value.split(".");
  const exp = Number(expStr);
  if (!exp || !sig || exp < Date.now() / 1000) return false;
  return safeEqual(sig, hmac(s.secret, `admin.${exp}`));
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyAdminSession(jar.get(ADMIN_COOKIE)?.value);
}
