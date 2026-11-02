"use client";

export const OPEN_CONSENT_EVENT = "wk:open-consent";

export function CookieSettingsLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className="flex min-h-11 items-center text-left text-sm font-semibold text-muted-foreground hover:text-foreground"
    >
      Cookie settings
    </button>
  );
}
