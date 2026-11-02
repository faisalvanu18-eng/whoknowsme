"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** Redacts secret-bearing URLs (creator dashboards) and per-attempt result ids before sending. */
function redact(url: string) {
  return url.replace(/\/dashboard\/[^/?#]+/, "/dashboard/[token]").replace(/\/result\/[^/?#]+/, "/result/[id]").replace(/\?.*$/, "");
}

export function VercelAnalytics() {
  return (
    <>
      <Analytics beforeSend={(e) => ({ ...e, url: redact(e.url) })} />
      <SpeedInsights beforeSend={(e) => ({ ...e, url: redact(e.url) })} />
    </>
  );
}
