"use client";

/**
 * Client analytics. Every event goes to GA4 (only stored by Google if consent allows; Consent
 * Mode v2 sends cookieless pings otherwise). A small whitelist also bumps first-party daily
 * counters via /api/track so /admin works without GA. No personal data is sent anywhere.
 */

export type AnalyticsEvent =
  | "page_view"
  | "visit"
  | "quiz_create_started"
  | "quiz_published"
  | "share_clicked"
  | "quiz_opened"
  | "quiz_started"
  | "question_answered"
  | "quiz_completed"
  | "result_shared"
  | "create_from_result"
  | "report_submitted"
  | "ad_slot_viewed"
  | "dashboard_opened"
  | "daily_question_answered";

// Server-side counters exist for these. quiz_published / quiz_completed / create_from_result /
// report_submitted are counted by the API routes themselves (trustworthy), so not sent twice.
const FIRST_PARTY = new Set<AnalyticsEvent>([
  "visit",
  "quiz_create_started",
  "quiz_opened",
  "quiz_started",
  "share_clicked",
  "result_shared",
  "ad_slot_viewed",
  "dashboard_opened",
  "daily_question_answered",
]);

type Params = { channel?: string; slug?: string; dim?: string; [k: string]: string | number | boolean | undefined };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* ignore */
  }
  if (!FIRST_PARTY.has(event)) return;
  const body = JSON.stringify({
    event,
    channel: params.channel,
    slug: params.slug,
    dim: params.dim,
  });
  try {
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/track", blob)) {
      void fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
    }
  } catch {
    /* analytics must never break the app */
  }
}

/** Counts one "visit" per device per UTC day without any identifier leaving the device. */
export function trackDailyVisit() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("wk_visit_day") === today) return;
    localStorage.setItem("wk_visit_day", today);
    track("visit");
  } catch {
    /* storage disabled (private mode / in-app browser) */
  }
}
