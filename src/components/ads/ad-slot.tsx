import { placementReady, type Placement } from "@/config/ads";
import { AdSlotClient } from "@/components/ads/ad-slot-client";

/**
 * Server gate for ad slots. The flags are build-time env vars, so while ads are OFF (or a
 * placement is disabled / the provider is not configured) this renders nothing and no ad
 * JavaScript is shipped at all.
 */
export function AdSlot({ placement, className }: { placement: Placement; className?: string }) {
  if (!placementReady(placement)) return null;
  return <AdSlotClient placement={placement} className={className} />;
}
