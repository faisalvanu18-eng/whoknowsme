/**
 * ============================================================================
 * AD PLACEMENT CONFIG: the one file to edit for A/B testing ad layouts.
 * ============================================================================
 *
 * Honest note: nothing in code can guarantee AdSense approval. This setup follows the published
 * AdSense program policies as closely as we can: ads only on pages with real publisher content,
 * never on quiz-taking or user-generated pages, never near interactive buttons, no popups,
 * interstitials or sticky overlays, max 3 per page, clearly labelled, space reserved (no CLS).
 *
 * Ads render only when ALL of these are true:
 *   1. NEXT_PUBLIC_ADS_ENABLED === "true"   (keep false until AdSense approves the site)
 *   2. NEXT_PUBLIC_ADSENSE_CLIENT is set
 *   3. The placement below is enabled
 *   4. Consent allows it (EEA/UK/CH: explicit consent via CMP; elsewhere: not opted out)
 *
 * Pages that must NEVER show ads (enforced in <AdSlot/> regardless of this file):
 *   /quiz/*, /create, /dashboard/*, /admin, /offline
 */

export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
export const MAX_ADS_PER_PAGE = 3;

export type Placement =
  | "home_mid" // homepage: between "how it works" and "question packs" content sections
  | "home_bottom" // homepage: after FAQ
  | "article_p2" // blog: after paragraph 2
  | "article_p5" // blog: after paragraph 5
  | "article_end" // blog: end of article
  | "result_bottom" // result page: BELOW score, share buttons and answer review
  | "content_mid" // how-it-works / packs / about: between content sections
  | "content_end";

type PlacementConfig = {
  enabled: boolean;
  /** AdSense ad unit ID (data-ad-slot). */
  slot: string;
  /** Reserved height in px (prevents layout shift). */
  minHeight: number;
  format: "auto" | "fluid" | "rectangle" | "horizontal";
  layout?: "in-article";
};

const SLOT = {
  home: process.env.NEXT_PUBLIC_AD_SLOT_HOME || "",
  article: process.env.NEXT_PUBLIC_AD_SLOT_ARTICLE || "",
  result: process.env.NEXT_PUBLIC_AD_SLOT_RESULT || "",
  content: process.env.NEXT_PUBLIC_AD_SLOT_CONTENT || "",
};

export const PLACEMENTS: Record<Placement, PlacementConfig> = {
  home_mid: { enabled: true, slot: SLOT.home, minHeight: 280, format: "auto" },
  home_bottom: { enabled: true, slot: SLOT.home, minHeight: 280, format: "auto" },
  article_p2: { enabled: true, slot: SLOT.article, minHeight: 280, format: "fluid", layout: "in-article" },
  article_p5: { enabled: true, slot: SLOT.article, minHeight: 280, format: "fluid", layout: "in-article" },
  article_end: { enabled: true, slot: SLOT.article, minHeight: 280, format: "auto" },
  result_bottom: { enabled: true, slot: SLOT.result, minHeight: 280, format: "auto" },
  content_mid: { enabled: true, slot: SLOT.content, minHeight: 280, format: "auto" },
  content_end: { enabled: false, slot: SLOT.content, minHeight: 280, format: "auto" },
};

/** Route prefixes where ads are forbidden no matter what. */
export const NO_AD_ROUTES = ["/quiz", "/create", "/dashboard", "/admin", "/offline", "/me"];

export function adsGloballyOn() {
  return ADS_ENABLED && ADSENSE_CLIENT.startsWith("ca-pub-");
}
