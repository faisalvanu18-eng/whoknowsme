import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle, readingMinutes } from "@/content/articles";
import { ArticleBody } from "@/components/layout/content-page";
import { AdSlot } from "@/components/ads/ad-slot";
import { ButtonLink } from "@/components/ui/button-link";
import { getPack } from "@/data/question-bank";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.date, url: `/blog/${a.slug}` },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  const pack = a.pack ? getPack(a.pack) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.updated ?? a.date,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/blog" className="underline">
          Guides
        </Link>{" "}
        / {a.category}
      </nav>
      <header className="mt-4">
        <span className="text-5xl" aria-hidden>
          {a.emoji}
        </span>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">{a.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{a.description}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          By the {SITE_NAME} team · <time dateTime={a.date}>{new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time> ·{" "}
          {readingMinutes(a)} min read
        </p>
      </header>

      <div className="mt-8">
        <ArticleBody blocks={a.blocks} adsAfterParagraph={{ 2: "article_p2", 5: "article_p5" }} />
      </div>

      <AdSlot placement="article_end" />

      <section aria-labelledby="related" className="mt-12">
        <h2 id="related" className="text-2xl font-extrabold">
          Keep reading
        </h2>
        <ul className="mt-4 grid gap-3">
          {related.map((r) => (
            <li key={r.slug}>
              <Link href={`/blog/${r.slug}`} className="flex min-h-14 items-center gap-3 rounded-2xl border bg-card p-4 font-bold hover:border-primary">
                <span aria-hidden>{r.emoji}</span> {r.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-12 rounded-3xl bg-brand-gradient p-6 text-center text-white">
        <p className="text-2xl font-extrabold">Put it to the test</p>
        <p className="mt-1 opacity-90">Make a quiz about yourself in 30 seconds and see who really knows you.</p>
        <ButtonLink href={pack ? `/packs/${pack.id}` : "/create"} variant="light" size="lg" className="mt-4">
          {pack ? `Try the ${pack.name} pack` : "Create my quiz"}
        </ButtonLink>
      </aside>
    </article>
  );
}
