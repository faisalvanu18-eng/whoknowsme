import { PLACEMENTS, adsGloballyOn, type Placement } from "@/config/ads";
import { AdSlotClient } from "@/components/ads/ad-slot-client";

/**
 * Server gate for ad slots. The flags are build-time env vars, so while ads are OFF (or a
 * placement is disabled) this renders nothing and no ad JavaScript is shipped at all.
 */
export function AdSlot({ placement, className }: { placement: Placement; className?: string }) {
  const cfg = PLACEMENTS[placement];
  if (!adsGloballyOn() || !cfg.enabled || !cfg.slot) return null;
  return <AdSlotClient placement={placement} className={className} />;
}
