import type { MetadataRoute } from "next";
import { ARTICLES } from "@/content/articles";
import { PACKS } from "@/data/question-bank";
import { SITE_URL } from "@/lib/site";

/** Only publisher content. Quiz/result/dashboard pages are user-generated or private and excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/create", "/how-it-works", "/packs", "/blog", "/about", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: (p === "" || p === "/blog" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: p === "" ? 1 : p === "/create" ? 0.9 : 0.6,
  }));
  const articles = ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(a.updated ?? a.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const packs = PACKS.map((p) => ({ url: `${SITE_URL}/packs/${p.id}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...staticPages, ...articles, ...packs];
}
