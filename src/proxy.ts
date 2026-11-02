import { NextResponse, type NextRequest } from "next/server";

// EEA + UK + Switzerland: Google requires a certified CMP / explicit consent before personalised ads.
const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
]);

/**
 * Sets a non-identifying region cookie ("eu" | "row") so the client knows whether consent is
 * required before loading ads. Only the region bucket is stored, never the country or IP.
 */
export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  if (request.cookies.has("wk_geo")) return res;
  const country = request.headers.get("x-vercel-ip-country");
  if (!country) return res; // unknown (local dev): client treats as consent-required
  res.cookies.set("wk_geo", CONSENT_COUNTRIES.has(country.toUpperCase()) ? "eu" : "row", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    secure: true,
    httpOnly: false,
  });
  return res;
}

export const config = {
  matcher: [
    // pages only: skip API, static assets, images, OG images, icons, PWA files
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|icon|apple-icon|pwa-icon|sw.js|manifest.webmanifest|robots.txt|sitemap.xml|ads.txt|.*opengraph-image.*|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|txt|xml|js|css|woff2?)$).*)",
  ],
};
