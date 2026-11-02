"use client";

/** Subtle haptic feedback where supported (Android Chrome). No-op elsewhere and with reduced motion. */
export function haptic(pattern: number | number[] = 12) {
  try {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // Browsers block vibrate() without a recent user gesture (and log an error), e.g. when a
    // flow auto-starts from a URL. Only buzz in response to a real tap.
    const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
    if (ua && !ua.isActive) return;
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
