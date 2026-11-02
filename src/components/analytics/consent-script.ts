/**
 * Google Consent Mode v2 defaults. Inlined in <head> BEFORE any Google tag loads.
 *  - EEA/UK/CH: everything denied until the user (or Google's certified CMP) grants consent.
 *  - Elsewhere: granted by default, user can opt out from "Cookie settings" in the footer.
 * A previously saved choice on this device is re-applied immediately.
 */
const REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

export const consentDefaultsScript = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500,region:${JSON.stringify(REGIONS)}});
gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted',functionality_storage:'granted',security_storage:'granted'});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',false);
try{var c=JSON.parse(localStorage.getItem('wk_consent')||'null');if(c&&c.v===1){gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.ads?'granted':'denied',ad_user_data:c.ads?'granted':'denied',ad_personalization:(c.ads&&c.personalized)?'granted':'denied'});}}catch(e){}
`.trim();

/** Queues gtag('js') + config right after the consent defaults (only when a valid GA4 ID is set). */
export function gaInitScript() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return "";
  return `gtag('js',new Date());gtag('config','${id}',{send_page_view:false,allow_google_signals:false});`;
}
