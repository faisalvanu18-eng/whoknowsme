import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy.
 *
 * AdSense and GA4 load scripts from many Google hosts and inject inline scripts, so a nonce-only
 * policy would force every page to render dynamically (killing static/ISR caching). We use a host
 * allowlist + 'unsafe-inline' for scripts instead. This is the trade-off Google documents for
 * AdSense publishers who cannot use nonces. Tighten it if you drop ads.
 */
const csp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://pagead2.googlesyndication.com",
    "https://*.googlesyndication.com",
    "https://*.adtrafficquality.google",
    "https://*.doubleclick.net",
    "https://www.google.com",
    "https://*.gstatic.com",
    "https://fundingchoicesmessages.google.com",
    "https://challenges.cloudflare.com",
    "https://va.vercel-scripts.com",
  ]
    .filter(Boolean)
    .join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://*.googlesyndication.com",
    "https://*.adtrafficquality.google",
    "https://*.doubleclick.net",
    "https://*.google.com",
    "https://fundingchoicesmessages.google.com",
    "https://challenges.cloudflare.com",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
  ].join(" "),
  [
    "frame-src",
    "https://*.doubleclick.net",
    "https://*.googlesyndication.com",
    "https://*.adtrafficquality.google",
    "https://www.google.com",
    "https://fundingchoicesmessages.google.com",
    "https://challenges.cloudflare.com",
  ].join(" "),
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Creator dashboards carry a secret in the URL: never leak it via Referer, never index.
        source: "/dashboard/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/(quiz|result)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
