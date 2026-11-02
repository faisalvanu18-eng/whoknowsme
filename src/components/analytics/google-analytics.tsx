"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track, trackDailyVisit } from "@/lib/analytics/events";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * GA4 loader. Consent Mode defaults are already set inline in <head>, so this tag respects them:
 * without consent GA only sends cookieless pings. Page views are sent manually on route change.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    trackDailyVisit();
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    // Strip secrets from paths before they reach GA (dashboard tokens!).
    const safePath = pathname.startsWith("/dashboard/") ? "/dashboard/[token]" : pathname;
    track("page_view", { page_path: safePath, page_location: `${location.origin}${safePath}`, page_title: document.title });
  }, [pathname]);

  if (!GA_ID) return null;
  // gtag('js') + gtag('config') are queued in the <head> inline script (see gaInitScript) so that
  // early events are never processed before the config command.
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />;
}
