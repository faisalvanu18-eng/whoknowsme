"use client";

import dynamic from "next/dynamic";

/**
 * Non-critical UI loaded after hydration in its own chunk, keeping it off the critical path.
 * The consent banner appears a moment after first paint, which is also less jarring.
 */
export const DeferredConsentBanner = dynamic(() => import("@/components/analytics/consent-banner").then((m) => m.ConsentBanner), {
  ssr: false,
});

/** Homepage "your quizzes on this device" strip (reads localStorage, so it can't SSR anyway). */
export const DeferredMyQuizzes = dynamic(() => import("@/components/dashboard/my-quizzes").then((m) => m.MyQuizzes), { ssr: false });
