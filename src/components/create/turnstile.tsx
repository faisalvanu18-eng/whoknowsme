"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
    __wkTurnstileLoading?: Promise<void>;
  }
}

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  if (!window.__wkTurnstileLoading) {
    window.__wkTurnstileLoading = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("turnstile_load_failed"));
      document.head.appendChild(s);
    });
  }
  return window.__wkTurnstileLoading;
}

export const turnstileEnabled = Boolean(SITE_KEY);

/**
 * Cloudflare Turnstile, rendered "interaction-only": invisible for almost everyone, a single
 * checkbox only if Cloudflare is unsure. Loaded only on the final create step.
 */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string | null) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  }, [onToken]);

  // Tokens are single-use: after a failed publish the parent bumps resetKey to get a fresh one.
  useEffect(() => {
    if (resetKey > 0 && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetKey]);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
          "refresh-expired": "auto",
        });
        widgetId.current = id;
      })
      .catch(() => cb.current(null));
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="flex min-h-0 justify-center" />;
}
