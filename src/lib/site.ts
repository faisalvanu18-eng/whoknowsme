export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Who Knows You Better?";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@example.com";
export const SITE_DESCRIPTION =
  "Make a fun quiz about yourself in 30 seconds, send it to friends, and find out who really knows you best. Free, no sign-up.";

export const RETENTION_DAYS = 7;
export const QUIZ_EXPIRY_DAYS = 30;
export const QUIZ_SIZES = [5, 10, 15] as const;
export type QuizSize = (typeof QUIZ_SIZES)[number];

export const COLORS = {
  primary: "#7047EB",
  blue: "#3984F7",
  lightBg: "#F4F1FF",
  darkBg: "#171525",
} as const;

export const NAV_LINKS = [
  { href: "/how-it-works", label: "Kaise kaam karta hai" },
  { href: "/packs", label: "Question packs" },
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
] as const;

export const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/blog", label: "Guides" },
  { href: "/packs", label: "Question packs" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
] as const;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
