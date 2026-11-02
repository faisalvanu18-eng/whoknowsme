"use client";

/**
 * Consent state stored on this device only (localStorage). Drives Google Consent Mode v2 and
 * whether ad slots render. Default for EEA/UK/CH visitors is "denied" until they choose.
 */

export type Consent = {
  v: 1;
  analytics: boolean;
  ads: boolean;
  /** false = non-personalised (restricted) ads only */
  personalized: boolean;
  ts: number;
};

const KEY = "wk_consent";
export const CONSENT_EVENT = "wk:consent";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    return c.v === 1 ? c : null;
  } catch {
    return null;
  }
}

export function writeConsent(c: Omit<Consent, "v" | "ts">) {
  const full: Consent = { v: 1, ts: Date.now(), ...c };
  try {
    localStorage.setItem(KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
  applyConsentMode(full);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: full }));
  return full;
}

export function applyConsentMode(c: Consent) {
  window.gtag?.("consent", "update", {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: c.ads ? "granted" : "denied",
    ad_user_data: c.ads ? "granted" : "denied",
    ad_personalization: c.ads && c.personalized ? "granted" : "denied",
  });
}

/** Set by proxy.ts from the Vercel geo header. "1" = EEA/UK/CH (consent required before ads). */
export function isConsentRegion(): boolean {
  if (typeof document === "undefined") return true;
  const m = document.cookie.match(/(?:^|;\s*)wk_geo=([^;]+)/);
  // Unknown region: be conservative and treat as consent-required.
  return !m || m[1] === "eu";
}

/** Whether ads may load at all right now. */
export function adsAllowed(c: Consent | null): boolean {
  if (!isConsentRegion()) return c ? c.ads : true;
  return Boolean(c?.ads);
}
