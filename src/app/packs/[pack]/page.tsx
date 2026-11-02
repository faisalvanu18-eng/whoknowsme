import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PACKS, getPack, questionsForPack } from "@/data/question-bank";
import { AdSlot } from "@/components/ads/ad-slot";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamicParams = false;

export function generateStaticParams() {
  return PACKS.map((p) => ({ pack: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ pack: string }> }): Promise<Metadata> {
  const { pack } = await params;
  const p = getPack(pack);
  if (!p) return {};
  const n = questionsForPack(p.id).length;
  return {
    title: `${p.name} quiz questions (${n} ideas)`,
    description: `${n} fun ${p.name.toLowerCase()} questions for a friendship quiz. ${p.tagline} Use them to make a quiz in 30 seconds.`,
    alternates: { canonical: `/packs/${p.id}` },
  };
}

export default async function PackPage({ params }: { params: Promise<{ pack: string }> }) {
  const { pack } = await params;
  const p = getPack(pack);
  if (!p) notFound();
  const questions = questionsForPack(p.id);
  const others = PACKS.filter((x) => x.id !== p.id);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/packs" className="underline">
          Question packs
        </Link>{" "}
        / {p.name}
      </nav>
      <header className="mt-4">
        <span className="text-5xl" aria-hidden>
          {p.emoji}
        </span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{p.name} quiz questions</h1>
        <p className="mt-2 text-lg text-muted-foreground">{p.tagline}</p>
      </header>

      <div className="prose-content mt-6">
        {p.intro.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <ButtonLink href={`/create?pack=${p.id}&size=10`} variant="gradient" size="lg">
          Use this pack (10 questions)
        </ButtonLink>
        <ButtonLink href={`/create?pack=${p.id}&size=5`} variant="secondary" size="lg">
          Quick 5 version
        </ButtonLink>
      </div>

      <section aria-labelledby="qs" className="mt-10">
        <h2 id="qs" className="text-2xl font-extrabold">
          All {questions.length} questions in this pack
        </h2>
        <p className="mt-1 text-muted-foreground">Each one comes with four answer options. When you make your quiz, you tap the one that&apos;s true for you.</p>
        <ol className="mt-4 space-y-3">
          {questions.map((q, i) => (
            <li key={q.id} className="rounded-2xl border bg-card p-4">
              <p className="font-bold">
                {i + 1}. {q.text}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{q.options.join(" · ")}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ad sits between two blocks of reading content, far from the action buttons above. */}
      <AdSlot placement="content_mid" />

      <section className="prose-content">
        <h2>Tips for a great {p.name.toLowerCase()} quiz</h2>
        <ul>
          <li>Swap any question that doesn&apos;t fit you. A quiz feels personal when every answer is genuinely true.</li>
          <li>Add one custom question only your closest friends could answer. It makes the top score mean something.</li>
          <li>Mix this pack with another theme for variety. The &quot;Build my own mix&quot; option lets you combine packs.</li>
          <li>Keep it short for big audiences. Five questions works best for Instagram Stories; ten is ideal for group chats.</li>
        </ul>
      </section>

      <section aria-labelledby="more" className="mt-10">
        <h2 id="more" className="text-xl font-extrabold">
          More packs
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.id} href={`/packs/${o.id}`} className="flex min-h-11 items-center gap-2 rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary">
              {o.emoji} {o.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
