import { SITE_URL } from "@/lib/site";
import type { ShareChannel } from "@/lib/validations";

export const QUIZ_SHARE_LINES = [
  "Shart laga lo, mere 10/10 nahi laa paoge 😏",
  "Tumhe lagta hai tum mujhe jaante ho? Prove karo 👀",
  "Isme sirf mere asli bestie pass honge 💜",
  "30 second ka hai. Dekhte hain mujhe kaun sunta hai 🫣",
];

export function quizUrl(slug: string, ref?: string) {
  return `${SITE_URL}/quiz/${slug}${ref ? `?ref=${ref}` : ""}`;
}

export function resultUrl(id: string, ref?: string) {
  return `${SITE_URL}/result/${id}${ref ? `?ref=${ref}` : ""}`;
}

export function quizShareText(nickname: string, size: number, lineIndex = 0) {
  const line = QUIZ_SHARE_LINES[lineIndex % QUIZ_SHARE_LINES.length].replace("10/10", `${size}/${size}`);
  return `${line}\n${nickname} ko kitna jaante ho? Mera quiz khelo:`;
}

export function resultShareText(opts: { creator: string; score: number; total: number; tier: string; grid: string }) {
  return `Maine ${opts.creator} ke quiz mein ${opts.score}/${opts.total} score kiya: "${opts.tier}" ${opts.score === opts.total ? "🏆" : ""}\n${opts.grid}\nTumhe lagta hai tum ${opts.creator} ko mujhse zyada jaante ho? 👇`;
}

/**
 * Snapchat share link.
 *  - Phones (fallback only): snapchat.com/scan?attachmentUrl= opens the Snapchat app on the camera
 *    with the quiz link attached to the snap. The share button prefers an Android intent or the iOS
 *    share sheet so the "send to friends" screen opens, like the web version.
 *  - Desktop: the official Snapchat for Web share sheet (snapchat.com/share?link=).
 * (Snapchat has no official way to prefill caption text, so the share text is copied to the clipboard.)
 */
export function snapchatUrl(url: string, mobile: boolean) {
  return mobile
    ? `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`
    : `https://www.snapchat.com/share?link=${encodeURIComponent(url)}`;
}

export function channelUrl(channel: ShareChannel, text: string, url: string) {
  const full = `${text}\n${url}`;
  switch (channel) {
    case "snapchat":
      return snapchatUrl(url, false);
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(full)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    case "messenger":
      return `fb-messenger://share/?link=${encodeURIComponent(url)}`;
    default:
      return url;
  }
}
