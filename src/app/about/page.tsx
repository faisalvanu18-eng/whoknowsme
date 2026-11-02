import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/content-page";
import { AdSlot } from "@/components/ads/ad-slot";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: `Why we built ${SITE_NAME}: a fast, privacy-first friendship quiz with no accounts and automatic data deletion.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title={`About ${SITE_NAME}`} intro="A tiny, friendly corner of the internet for finding out who really pays attention." />
      <div className="prose-content mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <p>
          {SITE_NAME} started with a simple observation: friendship quizzes are one of the most fun things people share with each other, but most quiz
          sites are slow, stuffed with pop-ups and ask for far more information than a game should. We wanted the opposite. A quiz you can make in
          thirty seconds, that your friends can play in two taps, and that forgets everyone&apos;s answers after a week.
        </p>
        <h2>What we believe</h2>
        <ul>
          <li>
            <strong>Fun should not cost your privacy.</strong> No accounts, no emails, no phone numbers, no real names. Friends&apos; answers are deleted
            automatically after 7 days.
          </li>
          <li>
            <strong>Fast beats fancy.</strong> The site is built to load quickly on budget phones and patchy mobile data, and works inside WhatsApp and
            Instagram&apos;s built-in browsers.
          </li>
          <li>
            <strong>Kind by default.</strong> Our question packs avoid sensitive topics and anything resembling an account-recovery question. Every quiz
            has a Report button and a real person reviews reports.
          </li>
          <li>
            <strong>Honest about money.</strong> The service is free. We show a small number of clearly labelled ads on our guide pages and on results,
            never in the middle of a quiz.
          </li>
        </ul>
        <h2>What we make</h2>
        <p>
          Besides the quiz itself, we write original <Link href="/blog">guides</Link> on friendship, conversation and quiz ideas, and hand-craft{" "}
          <Link href="/packs">question packs</Link> for different moods. Everything is written by our small team, reviewed for safety, and kept up to date.
        </p>
        <h2>Who it&apos;s for</h2>
        <p>
          Friends, classmates, coworkers, families, long-distance besties: anyone aged 13 or older who wants a quick laugh and a reason to talk. The site is
          not designed for young children.
        </p>
        <h2>Get in touch</h2>
        <p>
          Ideas, bugs or concerns? We read everything. Visit our <Link href="/contact">contact page</Link>. To report a specific quiz, use the Report button
          on that quiz.
        </p>
      </div>
      <AdSlot placement="content_mid" className="px-4" />
    </>
  );
}
