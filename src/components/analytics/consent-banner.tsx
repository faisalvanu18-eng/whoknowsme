"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPEN_CONSENT_EVENT } from "@/components/analytics/cookie-settings-link";
import { isConsentRegion, readConsent, writeConsent } from "@/lib/consent";
import { NO_AD_ROUTES } from "@/config/ads";

const GOOGLE_CMP = process.env.NEXT_PUBLIC_GOOGLE_CMP_ENABLED === "true";

/**
 * Built-in consent UI driving Consent Mode v2.
 * In EEA/UK/CH with NEXT_PUBLIC_GOOGLE_CMP_ENABLED=true, Google's certified CMP (configured in
 * AdSense > Privacy & messaging) is shown instead, and this banner stays hidden.
 * The banner never appears mid-quiz: it waits until the visitor reaches a non-quiz page.
 */
export function ConsentBanner() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [eu, setEu] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);
  const [personalized, setPersonalized] = useState(false);

  useEffect(() => {
    const region = isConsentRegion();
    const c = readConsent();
    /* eslint-disable react-hooks/set-state-in-effect -- reading device-local state after hydration */
    setEu(region);
    if (c) {
      setAnalytics(c.analytics);
      setAds(c.ads);
      setPersonalized(c.personalized);
    } else {
      setPersonalized(!region);
    }
    const quizFlow = NO_AD_ROUTES.some((r) => pathname.startsWith(r));
    if (!c && !quizFlow && !(region && GOOGLE_CMP)) setOpen(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname]);

  useEffect(() => {
    const onOpen = () => {
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
  }, []);

  if (!open) return null;

  const save = (c: { analytics: boolean; ads: boolean; personalized: boolean }) => {
    writeConsent(c);
    setOpen(false);
    setDetails(false);
  };

  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie preferences" className="fixed inset-x-0 bottom-0 z-50 p-3 pb-safe sm:p-4">
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-4 shadow-2xl shadow-black/20">
        <div className="flex gap-3">
          <Cookie className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
          <div className="text-sm">
            <p className="font-bold">{eu ? "Your privacy choices" : "We use cookies"}</p>
            <p className="mt-1 text-muted-foreground">
              We use cookies for anonymous analytics and, on article pages, ads that keep this site free. Quizzes work fine either way.{" "}
              <Link href="/privacy#cookies" className="font-semibold text-primary underline">
                Read our cookie policy
              </Link>
            </p>
          </div>
        </div>

        {details && (
          <fieldset className="mt-4 space-y-2 text-sm">
            <legend className="sr-only">Cookie categories</legend>
            <Toggle label="Essential" hint="Theme, your quizzes on this device. Always on." checked disabled />
            <Toggle label="Analytics" hint="Google Analytics, anonymous usage stats." checked={analytics} onChange={setAnalytics} />
            <Toggle label="Advertising" hint="Google AdSense ads on guide pages." checked={ads} onChange={setAds} />
            <Toggle
              label="Personalised ads"
              hint="Off = non-personalised (contextual) ads only."
              checked={ads && personalized}
              disabled={!ads}
              onChange={setPersonalized}
            />
          </fieldset>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {details ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => save({ analytics: false, ads: false, personalized: false })}>
                Reject all
              </Button>
              <Button size="sm" onClick={() => save({ analytics, ads, personalized: ads && personalized })}>
                Save choices
              </Button>
            </>
          ) : (
            <>
              {eu ? (
                <Button variant="secondary" size="sm" onClick={() => save({ analytics: false, ads: false, personalized: false })}>
                  Reject all
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setDetails(true)}>
                  Settings
                </Button>
              )}
              <Button size="sm" onClick={() => save({ analytics: true, ads: true, personalized: true })}>
                Accept all
              </Button>
              {eu && (
                <button type="button" onClick={() => setDetails(true)} className="col-span-2 min-h-11 text-sm font-semibold text-primary underline">
                  Customise
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl bg-muted/60 px-3 py-2">
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <input
        type="checkbox"
        className="size-5 accent-[var(--primary)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </label>
  );
}
