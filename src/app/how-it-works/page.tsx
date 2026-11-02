import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/content-page";
import { AdSlot } from "@/components/ads/ad-slot";
import { ButtonLink } from "@/components/ui/button-link";
import { TIERS } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "How it works",
  description: "How to make a friendship quiz, share it, and read your private leaderboard. Plus how scoring, privacy and data deletion work.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From idea to leaderboard in under a minute"
        intro="Everything you need to know about making a quiz, playing one, and what happens to the data."
      />
      <div className="prose-content mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <h2>For creators</h2>
        <ol>
          <li>
            <strong>Pick a starting set.</strong> Choose a template such as Best Friends 10, Quick 5 or Ultimate 15, or build your own mix of themes.
          </li>
          <li>
            <strong>Tap your answers.</strong> Every question shows four options. Tap the one that&apos;s true for you and the next question appears.
            Don&apos;t like a question? Tap &quot;Swap question&quot; or &quot;Write my own&quot;.
          </li>
          <li>
            <strong>Add a nickname and avatar.</strong> No real name needed. Pick an animal avatar so friends recognise your quiz in their chats.
          </li>
          <li>
            <strong>Publish and share.</strong> Send the link on Snapchat or Telegram, post the ready-made image to your Instagram Story, or show a QR code.
          </li>
          <li>
            <strong>Save your private results link.</strong> This is your key to the leaderboard. There are no accounts, so we can&apos;t recover it for you.
            We also remember it on the device you used, under &quot;My quizzes&quot;.
          </li>
        </ol>

        <h2>For friends</h2>
        <p>
          Open the link, tap Start, and answer. Adding a nickname is optional; it simply lets the creator know who played. One question appears per screen
          and you can go back if you change your mind. When you finish you&apos;ll see your score, a result title, which answers you got right, and how you
          compare with other friends in percentage terms. You never see other players&apos; names or answers.
        </p>

        <h2>How scoring works</h2>
        <p>
          You get one point for every answer that matches the creator&apos;s. Scoring happens on our server, and the correct answers are never sent to your
          browser before you submit, so nobody can peek. Retakes are allowed, with limits to prevent spam, and every attempt shows on the creator&apos;s
          leaderboard.
        </p>
        <table>
          <thead>
            <tr>
              <th>Score</th>
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t) => (
              <tr key={t.title}>
                <td>{t.min === 0 ? "Under 20%" : t.min === 100 ? "100%" : `${t.min}% or more`}</td>
                <td>
                  {t.emoji} {t.title}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot placement="content_mid" className="px-4" />

      <div className="prose-content mx-auto max-w-3xl px-4 sm:px-6">
        <h2>Privacy in plain words</h2>
        <ul>
          <li>We never ask for an email, phone number or real name.</li>
          <li>Friends&apos; answers and nicknames are deleted automatically 7 days after they play.</li>
          <li>Your quiz stays until you delete it, or for 30 days if you turn on auto-delete.</li>
          <li>We count things like &quot;quizzes created today&quot;, but only as totals, never per person.</li>
        </ul>
        <p>
          Read the full <Link href="/privacy">Privacy Policy</Link> for details on cookies, analytics and ads.
        </p>

        <h2>Tips for a great quiz</h2>
        <ul>
          <li>Make wrong answers believable, so the score actually means something.</li>
          <li>Add one custom question only your closest friends could answer.</li>
          <li>Reshare once a few scores are in: &quot;nobody has beaten 8/10 yet&quot; is very motivating.</li>
        </ul>
      </div>

      <div className="mx-auto mt-6 max-w-3xl px-4 text-center sm:px-6">
        <ButtonLink href="/create" variant="gradient" size="xl" className="w-full sm:w-auto">
          Make my quiz now
        </ButtonLink>
      </div>
    </>
  );
}
