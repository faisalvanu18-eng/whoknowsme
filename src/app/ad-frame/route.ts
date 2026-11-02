import { ADSTERRA } from "@/config/ads";

// Dynamic so ?kind= is read per request; the Cache-Control header below still lets the CDN cache each variant.
export const dynamic = "force-dynamic";

/**
 * /ad-frame?kind=banner|native
 *
 * A tiny standalone HTML page that loads ONE Adsterra ad. It is embedded by the site in a sandboxed
 * <iframe> (no same-origin, no top-navigation), so Adsterra's third-party script can't read or
 * redirect our pages. Because this response carries its own permissive CSP, the main site keeps a
 * strict one (Adsterra loads scripts from many rotating domains that can't be allowlisted).
 *
 * Keys/hosts come from server env and are strictly validated before being written into HTML.
 */
const KEY_RE = /^[A-Za-z0-9]{16,64}$/;
// Path of the ad script URL, e.g. /22/<key> or /<key>/invoke.js
const PATH_RE = /^\/[A-Za-z0-9/_.-]{1,200}$/;
const HOST_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

function page(body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;font-family:system-ui,sans-serif}</style></head><body>${body}</body></html>`;
}

export function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind");
  let html = "";

  if (kind === "banner" && KEY_RE.test(ADSTERRA.bannerKey)) {
    let src = "";
    if (ADSTERRA.bannerSrc) {
      try {
        const u = new URL(ADSTERRA.bannerSrc);
        if (u.protocol === "https:" && HOST_RE.test(u.hostname) && PATH_RE.test(u.pathname)) src = `${u.origin}${u.pathname}`;
      } catch {
        /* invalid env: render nothing */
      }
    } else if (HOST_RE.test(ADSTERRA.bannerHost)) {
      src = `https://${ADSTERRA.bannerHost}/${ADSTERRA.bannerKey}/invoke.js`;
    }
    if (src) {
      const opts = JSON.stringify({ key: ADSTERRA.bannerKey, format: "iframe", height: ADSTERRA.bannerHeight, width: ADSTERRA.bannerWidth, params: {} });
      html = page(`<script>atOptions = ${opts};</script><script src="${src}"></script>`);
    }
  } else if (kind === "native") {
    try {
      const u = new URL(ADSTERRA.nativeSrc);
      const m = u.pathname.match(/^\/([A-Za-z0-9]{16,64})\/invoke\.js$/);
      if (u.protocol === "https:" && HOST_RE.test(u.hostname) && m) {
        html = page(`<script async data-cfasync="false" src="${u.origin}/${m[1]}/invoke.js"></script><div id="container-${m[1]}"></div>`);
      }
    } catch {
      /* invalid env: render nothing */
    }
  }

  return new Response(html || page(""), {
    status: html ? 200 : 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self'",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
