import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/content-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The rules for using ${SITE_NAME}. For ages 13+.`,
  alternates: { canonical: "/terms" },
};

const UPDATED = "2 November 2026";

// NOTE FOR THE OPERATOR: fill in the bracketed details and have these terms reviewed before launch.
export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Use" intro={`Last updated: ${UPDATED}`} />
      <div className="prose-content mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <p>
          These terms are an agreement between you and [Operator name] (&quot;we&quot;, &quot;us&quot;) for using {SITE_NAME} (the &quot;Service&quot;). By
          creating or playing a quiz you agree to them. If you don&apos;t agree, please don&apos;t use the Service.
        </p>

        <h2>1. Who can use it</h2>
        <p>
          You must be at least <strong>13 years old</strong> to use the Service. If you are under 18 (or under the age of majority where you live), you
          confirm that a parent or guardian has agreed to these terms. The Service is not directed at children under 13.
        </p>

        <h2>2. Your quizzes</h2>
        <ul>
          <li>You are responsible for what you put in a quiz: the title, nickname, questions and answers.</li>
          <li>
            You keep ownership of your content. You give us a worldwide, non-exclusive, royalty-free licence to host, display and share it as needed to run
            the Service (for example, showing it to people who open your link and generating preview images). This licence ends when your quiz is deleted.
          </li>
          <li>
            Your private results link works like a password. Anyone who has it can view results and delete the quiz. We cannot recover lost links because we
            don&apos;t have accounts.
          </li>
        </ul>

        <h2>3. Acceptable use</h2>
        <p>Don&apos;t use the Service to create or share content that:</p>
        <ul>
          <li>bullies, harasses, threatens or humiliates anyone;</li>
          <li>contains personal information about you or other people (addresses, phone numbers, schools, private photos, etc.);</li>
          <li>is hateful or discriminates based on race, ethnicity, religion, disability, gender, sexual orientation or similar characteristics;</li>
          <li>is sexual, sexually suggestive, or involves minors in any inappropriate way;</li>
          <li>promotes violence, self-harm, illegal activity or dangerous behaviour;</li>
          <li>is spam, a scam, phishing (for example, collecting account-recovery answers) or advertising;</li>
          <li>infringes someone else&apos;s rights.</li>
        </ul>
        <p>
          Also don&apos;t try to break, overload, scrape or reverse-engineer the Service, bypass rate limits or bot protection, or manipulate scores or
          statistics.
        </p>

        <h2>4. Moderation</h2>
        <p>
          Anyone can report a quiz. We may review, hide or delete any quiz that we believe breaks these terms or the law, with or without notice. Quizzes
          that receive several reports may be hidden automatically until reviewed.
        </p>

        <h2>5. Data and privacy</h2>
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains what we process. In short: no accounts, friends&apos; answers deleted after 7 days, and
          quizzes kept until deleted (or 30 days if you choose auto-delete).
        </p>

        <h2>6. Ads</h2>
        <p>The Service is free and may display third-party advertising on some pages. We are not responsible for the content of third-party ads or sites.</p>

        <h2>7. No warranties</h2>
        <p>
          The Service is provided &quot;as is&quot; for entertainment. Quiz scores are a game, not a measure of anyone&apos;s friendship. We don&apos;t
          guarantee the Service will be available, error-free, or that data will be preserved (it is deleted on purpose, as described above).
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential damages, or for content created by users. Our
          total liability for any claim relating to the Service is limited to the amount you paid us, which is zero. Nothing in these terms limits
          liability that cannot be limited by law, or your statutory rights as a consumer.
        </p>

        <h2>9. Changes and termination</h2>
        <p>
          We may change the Service or these terms. If we make significant changes we will update the date above. We may suspend access for anyone who
          breaks these terms. You can stop using the Service at any time and delete your quizzes from your dashboard.
        </p>

        <h2>10. Governing law</h2>
        <p>
          These terms are governed by the laws of [jurisdiction], without prejudice to mandatory consumer protection laws of the country where you live.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    </>
  );
}
