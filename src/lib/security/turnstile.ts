import "server-only";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * If TURNSTILE_SECRET_KEY is not configured (local dev) verification is skipped.
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
      console.warn("[turnstile] TURNSTILE_SECRET_KEY missing in production; bot protection is OFF");
    }
    return true;
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Fail closed: if Cloudflare is unreachable the user can simply retry.
    return false;
  }
}
