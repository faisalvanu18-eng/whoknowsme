import Link from "next/link";
import { PACKS, TEMPLATES } from "@/data/question-bank";
import { ARTICLES } from "@/content/articles";

export function TemplateChips() {
  return (
    <section aria-labelledby="quick-start" className="mx-auto max-w-5xl px-4 sm:px-6">
      <h2 id="quick-start" className="text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
        Start from a template
      </h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] sm:flex-wrap sm:justify-center">
        {TEMPLATES.map((t) => (
          <Link
            key={t.id}
            href={`/create?template=${t.id}`}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 bg-card px-4 text-sm font-bold hover:border-primary"
          >
            <span aria-hidden>{t.emoji}</span> {t.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HowSteps() {
  const steps = [
    { n: "1", title: "Tap your answers", text: "Pick a template and tap what's true for you. Swap any question or write your own." },
    { n: "2", title: "Share your link", text: "One tap to WhatsApp, Telegram, Instagram Story or a QR code. Friends don't need an account." },
    { n: "3", title: "See who knows you", text: "Friends get a score and a fun title. You get a private leaderboard of everyone who played." },
  ];
  return (
    <section aria-labelledby="how" className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h2 id="how" className="text-3xl font-extrabold tracking-tight">
        Three steps. Zero sign-ups.
      </h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="rounded-3xl border bg-card p-6">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-gradient font-extrabold text-white">{s.n}</span>
            <h3 className="mt-4 text-lg font-extrabold">{s.title}</h3>
            <p className="mt-1 text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PacksGrid() {
  return (
    <section aria-labelledby="packs" className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id="packs" className="text-3xl font-extrabold tracking-tight">
          Question packs
        </h2>
        <Link href="/packs" className="min-h-11 content-center text-sm font-bold text-primary">
          See all →
        </Link>
      </div>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Over 90 hand-written questions about tastes, habits and silly hypotheticals. Nothing private, nothing that looks like a password-reset question.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PACKS.map((p) => (
          <Link key={p.id} href={`/packs/${p.id}`} className="rounded-2xl border-2 bg-card p-4 transition-colors hover:border-primary">
            <span className="text-3xl" aria-hidden>
              {p.emoji}
            </span>
            <span className="mt-2 block font-extrabold">{p.name}</span>
            <span className="block text-sm text-muted-foreground">{p.tagline}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LatestGuides() {
  return (
    <section aria-labelledby="guides" className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id="guides" className="text-3xl font-extrabold tracking-tight">
          Friendship guides
        </h2>
        <Link href="/blog" className="min-h-11 content-center text-sm font-bold text-primary">
          All guides →
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {ARTICLES.slice(0, 3).map((a) => (
          <Link key={a.slug} href={`/blog/${a.slug}`} className="rounded-3xl border bg-card p-5 hover:border-primary">
            <span className="text-3xl" aria-hidden>
              {a.emoji}
            </span>
            <span className="mt-2 block text-xs font-bold uppercase tracking-widest text-primary">{a.category}</span>
            <span className="mt-1 block text-lg font-extrabold leading-snug">{a.title}</span>
            <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{a.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const FAQ_ITEMS = [
  { q: "Is it free?", a: "Yes. Creating and playing quizzes is completely free. We keep the lights on with a few clearly labelled ads on our guide pages, never inside quizzes." },
  { q: "Do my friends need an account?", a: "No. They open your link, tap Start and answer. Adding a nickname is optional so you know who played." },
  { q: "Who can see the scores?", a: "Each friend sees their own score and how they compare in percentages. Only you see the full leaderboard, through your private results link." },
  { q: "What happens to the answers?", a: "Friends' answers and nicknames are deleted automatically after 7 days. Your quiz stays until you delete it, or for 30 days if you choose auto-delete." },
  { q: "I lost my results link. What now?", a: "If you created the quiz on this device, open \"My quizzes\" in the footer. Because there are no accounts we can't recover links any other way, so please save yours." },
  { q: "Can friends retake the quiz?", a: "Yes, retakes are allowed (with sensible limits). Every attempt appears on your leaderboard." },
  { q: "Is there an age limit?", a: "Who Knows You Better? is for people aged 13 and over." },
];

export function Faq() {
  return (
    <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h2 id="faq" className="text-3xl font-extrabold tracking-tight">
        Questions, answered
      </h2>
      <div className="mt-6 space-y-2">
        {FAQ_ITEMS.map((f) => (
          <details key={f.q} className="group rounded-2xl border bg-card px-5 open:pb-4">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-bold">
              {f.q}
              <span className="text-xl text-primary transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <p className="text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
