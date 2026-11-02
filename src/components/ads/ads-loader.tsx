"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT, AD_PROVIDER, NO_AD_ROUTES, adsGloballyOn } from "@/config/ads";
import { CONSENT_EVENT, adsAllowed, isConsentRegion, readConsent } from "@/lib/consent";

// Google's CMP only covers Google ads, so it is ignored for Adsterra (our own banner handles consent).
const GOOGLE_CMP = AD_PROVIDER === "adsense" && process.env.NEXT_PUBLIC_GOOGLE_CMP_ENABLED === "true";
export const ADS_READY_EVENT = "wk:ads-ready";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number; pauseAdRequests?: number };
    __wkAdsLoaded?: boolean;
  }
}

/** Whether ad slots may render right now (flag + route + consent). */
export function canShowAds(pathname: string) {
  if (!adsGloballyOn()) return false;
  if (NO_AD_ROUTES.some((r) => pathname.startsWith(r))) return false;
  if (GOOGLE_CMP && isConsentRegion()) return true; // Google's certified CMP gates ad serving itself
  return adsAllowed(readConsent());
}

/**
 * Injects the AdSense library once, only on pages that may show ads and only after consent
 * where required. Auto ads must stay OFF in the AdSense dashboard (they create sticky overlays).
 */
export function AdsLoader() {
  const pathname = usePathname();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener(CONSENT_EVENT, on);
    return () => window.removeEventListener(CONSENT_EVENT, on);
  }, []);

  useEffect(() => {
    // Adsterra needs no global script: its banners live in sandboxed iframes (see /ad-frame).
    if (AD_PROVIDER !== "adsense" || window.__wkAdsLoaded || !canShowAds(pathname)) return;
    const c = readConsent();
    window.adsbygoogle = window.adsbygoogle || ([] as unknown as NonNullable<Window["adsbygoogle"]>);
    if (c && !c.personalized) window.adsbygoogle.requestNonPersonalizedAds = 1;
    const s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    s.onload = () => window.dispatchEvent(new Event(ADS_READY_EVENT));
    document.head.appendChild(s);
    window.__wkAdsLoaded = true;
  }, [pathname, tick]);

  return null;
}
