import type { Metadata } from "next";
import Link from "next/link";
import { PACKS, questionsForPack } from "@/data/question-bank";
import { PageHeader } from "@/components/layout/content-page";

export const metadata: Metadata = {
  title: "Friendship quiz question packs",
  description: "Themed packs of fun, safe questions for your friendship quiz: Best Friends, Food, Movies & Music, Travel, Personality, Gaming and Random.",
  alternates: { canonical: "/packs" },
};

export default function PacksIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Question packs"
        title="Pick a vibe for your quiz"
        intro="Every pack is hand-written to be fun, fair and safe to share. No addresses, birthdays or anything that looks like a password-reset question."
      />
      <div className="mx-auto mt-8 grid max-w-3xl gap-3 px-4 sm:grid-cols-2 sm:px-6">
        {PACKS.map((p) => (
          <Link key={p.id} href={`/packs/${p.id}`} className="rounded-3xl border-2 bg-card p-5 transition-colors hover:border-primary">
            <span className="text-4xl" aria-hidden>
              {p.emoji}
            </span>
            <span className="mt-2 block text-xl font-extrabold">{p.name}</span>
            <span className="block text-muted-foreground">{p.tagline}</span>
            <span className="mt-2 block text-sm font-bold text-primary">{questionsForPack(p.id).length} questions →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
