import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/content-page";
import { CookieSettingsLink } from "@/components/analytics/cookie-settings-link";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data: no accounts, 7-day deletion of answers, cookies, analytics and advertising.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "2 November 2026";

/*
 * NOTE FOR THE OPERATOR: this policy describes exactly what the code does. Replace the bracketed
 * operator details and have it reviewed by a lawyer for your jurisdiction before launch.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" intro={`Last updated: ${UPDATED}`} />
      <div className="prose-content mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <p>
          This policy explains what information {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) processes when you use {SITE_URL}, why, and for how long. The
          short version: we don&apos;t have accounts, we never ask for your email, phone number or real name, and friends&apos; quiz answers are deleted
          automatically after 7 days.
        </p>

        <h2>1. Who is responsible</h2>
        <p>
          The service is operated by [Operator name and address]. For any privacy question or request, contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. This address also serves as our Grievance Officer contact under India&apos;s Digital
          Personal Data Protection Act, 2023 (DPDP Act).
        </p>

        <h2>2. What we collect</h2>
        <h3>When you create a quiz</h3>
        <ul>
          <li>The nickname, animal avatar and title you choose.</li>
          <li>Your questions, answer options and the answers you mark as yours.</li>
          <li>Whether you chose 30-day auto-deletion.</li>
          <li>
            A secret dashboard token. We store only a one-way hash of it, so even we cannot read your private link from our database.
          </li>
        </ul>
        <h3>When you play a quiz</h3>
        <ul>
          <li>Your answers and score.</li>
          <li>An optional nickname, if you enter one.</li>
          <li>A random key, stored in a cookie on your device, that lets only you see your answer review.</li>
        </ul>
        <h3>Aggregate statistics</h3>
        <p>
          We keep daily totals, such as &quot;quizzes created&quot;, &quot;quizzes completed&quot; or &quot;shares via WhatsApp&quot;. These are counters only;
          they contain no identifiers and cannot be linked to you. Anonymous referral codes in links (<code>?ref=</code>) identify a quiz or result, not a
          person.
        </p>
        <h3>Technical data</h3>
        <p>
          Like every website, our servers receive your IP address and browser details when you connect. We use the IP address briefly, in hashed form, to
          prevent spam and abuse (rate limiting). We do not store it in our database. Our hosting provider may keep short-lived security logs.
        </p>
        <h3>What we never collect</h3>
        <p>
          Email addresses, phone numbers, real names, precise location, contacts, or social media logins. Our filters block contact details in quiz text,
          and our question packs avoid sensitive topics. Please don&apos;t include personal information about yourself or anyone else in custom questions.
        </p>

        <h2>3. Why we use it (legal bases)</h2>
        <ul>
          <li>
            <strong>To provide the service</strong> you asked for: showing quizzes, scoring them and showing results (performance of a contract / your
            request).
          </li>
          <li>
            <strong>To keep the service safe</strong>: rate limiting, bot protection, moderation of reports (legitimate interests).
          </li>
          <li>
            <strong>Analytics and advertising cookies</strong>: only with your consent where the law requires it, such as in the EEA, UK and Switzerland
            (consent). Elsewhere you can opt out at any time.
          </li>
        </ul>
        <p>Under the DPDP Act, we process personal data for the specified purposes above, based on your consent or legitimate uses permitted by the Act.</p>

        <h2>4. How long we keep it</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Friends&apos; answers, scores and nicknames</td>
              <td>Deleted automatically 7 days after the attempt (checked every hour)</td>
            </tr>
            <tr>
              <td>Quizzes (title, questions, creator nickname, avatar)</td>
              <td>Until the creator deletes it, or 30 days if auto-delete was chosen</td>
            </tr>
            <tr>
              <td>Reports</td>
              <td>Up to 90 days after a moderator resolves them, and never longer than 180 days</td>
            </tr>
            <tr>
              <td>Aggregate daily counters</td>
              <td>Up to 2 years (contain no personal data)</td>
            </tr>
            <tr>
              <td>Rate-limit counters</td>
              <td>Minutes to hours (hashed, expire automatically)</td>
            </tr>
          </tbody>
        </table>

        <h2 id="cookies">5. Cookies and device storage</h2>
        <p>We use a small number of first-party items, all of which are needed for the site to work:</p>
        <ul>
          <li>
            <code>wk_geo</code> (cookie, 30 days): stores only whether you are in a region where consent is required (&quot;eu&quot; or &quot;row&quot;).
          </li>
          <li>
            <code>wkr_…</code> (cookie, 7 days): lets you, and only you, see the answer review for your attempt.
          </li>
          <li>
            Local storage: your theme, cookie choices, &quot;My quizzes on this device&quot; (including your private dashboard links), quizzes you played,
            and the nickname you last used. This never leaves your device unless you submit a quiz.
          </li>
        </ul>
        <p>With your consent (or unless you opt out, depending on your region), third parties may also set cookies:</p>
        <ul>
          <li>
            <strong>Google Analytics 4</strong> (analytics): measures visits and feature usage. We use Google Consent Mode v2; without consent, Google
            receives only cookieless, aggregated signals. Google signals are disabled.
          </li>
          <li>
            <strong>Google AdSense</strong> (advertising): see section 6.
          </li>
          <li>
            <strong>Cloudflare Turnstile</strong> (security): checks that quiz creators are human. It may process technical data about your browser.
          </li>
        </ul>
        <p>
          You can change your choices at any time: <CookieSettingsLink />
        </p>

        <h2>6. Advertising</h2>
        <p>
          We show ads from Google AdSense on some content pages and below quiz results, never inside a quiz. Third-party vendors, including Google, use
          cookies to serve ads based on your prior visits to this and other websites. Google&apos;s use of advertising cookies enables it and its partners
          to serve ads based on your visits to this site and/or other sites on the internet.
        </p>
        <ul>
          <li>
            You can opt out of personalised advertising in <a href="https://adssettings.google.com" rel="noopener noreferrer">Google Ads Settings</a>, or
            via <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer">aboutads.info</a> and{" "}
            <a href="https://www.youronlinechoices.eu/" rel="noopener noreferrer">youronlinechoices.eu</a>.
          </li>
          <li>
            Learn{" "}
            <a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer">
              how Google uses information from sites that use its services
            </a>
            .
          </li>
          <li>
            In the EEA, UK and Switzerland, ads load only after you consent, using a Google-certified consent platform. You can choose non-personalised
            ads only.
          </li>
        </ul>

        <h2>7. Who processes data for us</h2>
        <ul>
          <li>Vercel Inc. (hosting, content delivery, privacy-friendly performance analytics)</li>
          <li>Supabase Inc. (database)</li>
          <li>Upstash Inc. (rate limiting, hashed keys only)</li>
          <li>Cloudflare Inc. (bot protection)</li>
          <li>Google LLC (analytics and advertising, as described above)</li>
        </ul>
        <p>
          Some of these providers process data outside your country, including in the United States. Where required, transfers rely on appropriate
          safeguards such as the EU Standard Contractual Clauses or the EU-US Data Privacy Framework.
        </p>

        <h2>8. Your rights</h2>
        <p>
          Depending on where you live (for example under the GDPR, UK GDPR or DPDP Act), you may have the right to access, correct, delete or restrict the
          processing of your personal data, to withdraw consent at any time, to nominate someone to exercise your rights (DPDP), and to complain to a
          supervisory authority or the Data Protection Board of India.
        </p>
        <p>
          Because we have no accounts, we identify data by link. Creators can delete their quiz and all its results instantly from their private dashboard.
          For anything else, email us with the relevant quiz or result link. We will respond within 30 days.
        </p>

        <h2>9. Age</h2>
        <p>
          {SITE_NAME} is intended for people aged 13 and over and is not directed at children. If you are under 18 in India, or under the age of digital
          consent where you live, please use the service only with a parent&apos;s or guardian&apos;s permission. If you believe a child has given us
          personal data, contact us and we will delete it.
        </p>

        <h2>10. Security</h2>
        <p>
          We use encryption in transit (HTTPS), hashed secrets, strict database access rules, rate limiting, bot protection and automatic deletion. No
          system is perfectly secure, so please don&apos;t put sensitive information in quizzes.
        </p>

        <h2>11. Changes</h2>
        <p>
          We will update this page if our practices change and revise the date above. Significant changes will be highlighted on the homepage. See also our{" "}
          <Link href="/terms">Terms of Use</Link>.
        </p>
      </div>
    </>
  );
}
