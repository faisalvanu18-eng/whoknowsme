import { articles1 } from "./articles-1";
import { articles2 } from "./articles-2";
import { articles3 } from "./articles-3";
import type { Article } from "./types";

export type { Article, Block } from "./types";

export const ARTICLES: Article[] = [...articles1, ...articles2, ...articles3].sort((a, b) => (a.date < b.date ? 1 : -1));

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export function readingMinutes(a: Article) {
  const words = a.blocks
    .map((b) => ("text" in b ? b.text : b.items.join(" ")))
    .join(" ")
    .split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}
