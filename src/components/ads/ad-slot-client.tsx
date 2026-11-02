"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT, ADSTERRA, AD_PROVIDER, PLACEMENTS, adsterraKindFor, type Placement } from "@/config/ads";
import { canShowAds } from "@/components/ads/ads-loader";
import { CONSENT_EVENT } from "@/lib/consent";
import { track } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

/**
 * Policy-safe ad slot (rendered only via the <AdSlot/> server gate):
 *  - reserves its height up front (no CLS), clearly labelled "Advertisement"
 *  - lazy: the ad is only created when the slot is near the viewport
 *  - generous margins so it never sits next to buttons
 *  - collapses if consent is missing where it is required
 *  - Adsterra runs inside a sandboxed iframe (see /ad-frame): no DOM access, no page redirects
 */
export function AdSlotClient({ placement, className }: { placement: Placement; className?: string }) {
  const cfg = PLACEMENTS[placement];
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [allowed, setAllowed] = useState(true);
  const [visible, setVisible] = useState(false);
  const pushed = useRef(false);

  const adsterraKind = AD_PROVIDER === "adsterra" ? adsterraKindFor(cfg.kind) : null;
  const height = adsterraKind === "native" ? ADSTERRA.nativeHeight : adsterraKind === "banner" ? ADSTERRA.bannerHeight : cfg.minHeight;

  useEffect(() => {
    const check = () => setAllowed(canShowAds(pathname));
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, [pathname]);

  useEffect(() => {
    if (!allowed || !ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [allowed]);

  useEffect(() => {
    if (!visible || pushed.current) return;
    pushed.current = true;
    try {
      if (AD_PROVIDER === "adsense") {
        (window.adsbygoogle = window.adsbygoogle || ([] as unknown as NonNullable<Window["adsbygoogle"]>)).push({});
      }
      track("ad_slot_viewed", { dim: placement });
    } catch {
      /* ad blockers etc. */
    }
  }, [visible, placement]);

  if (!allowed) return null;

  return (
    <aside ref={ref} aria-label="Advertisement" className={cn("mx-auto my-12 w-full max-w-3xl", className)} data-placement={placement}>
      <p className="mb-1 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground/80">Advertisement</p>
      <div className="flex justify-center overflow-hidden rounded-xl bg-muted/40" style={{ minHeight: height }}>
        {visible && adsterraKind && (
          <iframe
            title="Advertisement"
            src={`/ad-frame?kind=${adsterraKind}`}
            loading="lazy"
            scrolling="no"
            // No allow-same-origin (ad code can't reach our page) and no allow-top-navigation (ad code
            // can't redirect the page). Clicks may still open the advertiser in a new tab.
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              border: 0,
              width: adsterraKind === "banner" ? ADSTERRA.bannerWidth : "100%",
              maxWidth: "100%",
              height,
            }}
          />
        )}
        {visible && AD_PROVIDER === "adsense" && (
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: cfg.minHeight, width: "100%" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={cfg.slot}
            data-ad-format={cfg.format}
            data-ad-layout={cfg.layout}
            data-full-width-responsive="true"
          />
        )}
      </div>
    </aside>
  );
}
