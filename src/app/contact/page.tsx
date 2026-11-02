import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/content-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact the ${SITE_NAME} team about feedback, privacy requests or reporting a quiz.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch" intro="We're a small team and we read every message. We usually reply within 2 working days." />
      <div className="prose-content mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <div className="not-prose rounded-3xl border-2 bg-card p-6">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Email</p>
          <p className="mt-1 text-2xl font-extrabold">
            <a href={`mailto:${CONTACT_EMAIL}`} className="break-all">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>

        <h2>Report a quiz</h2>
        <p>
          The fastest way is the <strong>Report</strong> button on the quiz itself. Reports are anonymous and go straight to our moderation queue. If a quiz
          is urgent (for example, it shares someone&apos;s personal information or targets a person), email us with the quiz link and we&apos;ll prioritise it.
        </p>

        <h2>Privacy and data requests</h2>
        <p>
          Because we don&apos;t have accounts, we can only identify data through links. To delete a quiz, open your private results link and choose
          &quot;Delete quiz&quot;. To ask about an answer you gave, send us the result link. Friends&apos; answers are deleted automatically after 7 days
          anyway. See our <Link href="/privacy">Privacy Policy</Link> for your rights under GDPR and India&apos;s DPDP Act.
        </p>

        <h2>Advertising and partnerships</h2>
        <p>We don&apos;t sell user data and we don&apos;t run sponsored quizzes. For other partnership ideas, email us.</p>

        <h2>Please don&apos;t send</h2>
        <p>Passwords, ID documents, or personal details about other people. We&apos;ll never ask for them.</p>
      </div>
    </>
  );
}
