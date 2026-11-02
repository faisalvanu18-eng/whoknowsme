/**
 * ============================================================================
 * AD PLACEMENT CONFIG: the one file to edit for A/B testing ad layouts.
 * ============================================================================
 *
 * Ad provider: Adsterra (default) or Google AdSense (NEXT_PUBLIC_AD_PROVIDER=adsense).
 *
 * Adsterra ads are NOT injected into our pages. Each slot is a sandboxed <iframe> that loads
 * /ad-frame, a separate page with its own CSP. That means Adsterra's scripts cannot touch our DOM,
 * cannot redirect the page (no top navigation), and our main site keeps its strict CSP.
 *
 * Ads render only when ALL of these are true:
 *   1. NEXT_PUBLIC_ADS_ENABLED === "true"
 *   2. The provider is configured (Adsterra banner key / native script, or AdSense client + slots)
 *   3. The placement below is enabled
 *   4. Consent allows it (EEA/UK/CH: explicit consent; elsewhere: not opted out)
 *
 * Pages that must NEVER show ads (enforced in code regardless of this file):
 *   /quiz/*, /create, /dashboard/*, /admin, /offline, /me
 *
 * We deliberately do not use Adsterra's Popunder, Social Bar or Direct Link formats: they open
 * new tabs or overlay the page, which would hurt your users and your retention.
 */

export const ADS_ENABLED = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
export const AD_PROVIDER: "adsterra" | "adsense" = process.env.NEXT_PUBLIC_AD_PROVIDER === "adsense" ? "adsense" : "adsterra";
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
export const MAX_ADS_PER_PAGE = 3;

export const ADSTERRA = {
  /** Banner 300x250 key (32 hex chars) from Adsterra > Websites > Get code. */
  bannerKey: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY || "",
  /** Full banner script URL from the code Adsterra gives you, e.g. https://bicea.org/22/<key>. Preferred. */
  bannerSrc: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_SRC || "",
  /** Legacy form: host of a  https://HOST/<key>/invoke.js  script (only used when bannerSrc is empty). */
  bannerHost: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_HOST || "www.highperformanceformat.com",
  bannerHeight: 250,
  bannerWidth: 300,
  /** Full Native Banner script URL, e.g. https://pl123.profitablecpm.com/<key>/invoke.js */
  nativeSrc: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC || "",
  nativeHeight: Number(process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_HEIGHT) || 300,
};

export type AdKind = "banner" | "native";

/** Which Adsterra format a placement can actually use right now (native falls back to banner). */
export function adsterraKindFor(wanted: AdKind): AdKind | null {
  if (wanted === "native" && ADSTERRA.nativeSrc) return "native";
  if (ADSTERRA.bannerKey) return "banner";
  return null;
}

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
  /** Adsterra format wanted here (falls back to banner if no native script is configured). */
  kind: AdKind;
  /** AdSense only: ad unit ID (data-ad-slot). */
  slot: string;
  /** Reserved height in px (prevents layout shift). */
  minHeight: number;
  /** AdSense only. */
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
  home_mid: { enabled: true, kind: "banner", slot: SLOT.home, minHeight: 280, format: "auto" },
  home_bottom: { enabled: true, kind: "banner", slot: SLOT.home, minHeight: 280, format: "auto" },
  article_p2: { enabled: true, kind: "banner", slot: SLOT.article, minHeight: 280, format: "fluid", layout: "in-article" },
  article_p5: { enabled: true, kind: "native", slot: SLOT.article, minHeight: 280, format: "fluid", layout: "in-article" },
  article_end: { enabled: true, kind: "banner", slot: SLOT.article, minHeight: 280, format: "auto" },
  result_bottom: { enabled: true, kind: "banner", slot: SLOT.result, minHeight: 280, format: "auto" },
  content_mid: { enabled: true, kind: "banner", slot: SLOT.content, minHeight: 280, format: "auto" },
  content_end: { enabled: false, kind: "banner", slot: SLOT.content, minHeight: 280, format: "auto" },
};

/** Route prefixes where ads are forbidden no matter what. */
export const NO_AD_ROUTES = ["/quiz", "/create", "/dashboard", "/admin", "/offline", "/me"];

export function adsGloballyOn() {
  if (!ADS_ENABLED) return false;
  if (AD_PROVIDER === "adsense") return ADSENSE_CLIENT.startsWith("ca-pub-");
  return Boolean(ADSTERRA.bannerKey || ADSTERRA.nativeSrc);
}

/** True when this placement has everything it needs to render with the current provider. */
export function placementReady(p: Placement) {
  const cfg = PLACEMENTS[p];
  if (!adsGloballyOn() || !cfg.enabled) return false;
  return AD_PROVIDER === "adsense" ? Boolean(cfg.slot) : adsterraKindFor(cfg.kind) !== null;
}
