import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES, readingMinutes } from "@/content/articles";
import { PageHeader } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Friendship guides, quiz ideas & question lists",
  description: "Original guides on friendship, quiz ideas, icebreakers and fun questions to ask your best friend.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Guides"
        title="Friendship guides & quiz ideas"
        intro="Question lists, game ideas and practical tips for staying close to the people who matter. Written by our team, free to read."
      />
      <div className="mx-auto mt-8 grid max-w-3xl gap-4 px-4 sm:px-6">
        {ARTICLES.map((a) => (
          <Link key={a.slug} href={`/blog/${a.slug}`} className="flex gap-4 rounded-3xl border bg-card p-5 transition-colors hover:border-primary">
            <span className="text-4xl" aria-hidden>
              {a.emoji}
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-widest text-primary">
                {a.category} · {readingMinutes(a)} min read
              </span>
              <span className="mt-1 block text-xl font-extrabold leading-snug">{a.title}</span>
              <span className="mt-1 block text-muted-foreground">{a.description}</span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
