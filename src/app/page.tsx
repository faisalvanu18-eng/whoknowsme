import { Hero } from "@/components/homepage/hero";
import { DailyQuestion } from "@/components/homepage/daily-question";
import { FAQ_ITEMS, Faq, HowSteps, LatestGuides, PacksGrid, TemplateChips } from "@/components/homepage/sections";
import { DeferredMyQuizzes } from "@/components/analytics/deferred";
import { AdSlot } from "@/components/ads/ad-slot";
import { ButtonLink } from "@/components/ui/button-link";
import { dailyQuestion } from "@/data/question-bank";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// Static, regenerated hourly so the question of the day rolls over.
export const revalidate = 3600;

export default function HomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <TemplateChips />
      <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
        <DeferredMyQuizzes compact />
      </div>
      <HowSteps />
      <div className="mx-auto max-w-xl px-4">
        <DailyQuestion question={dailyQuestion()} />
      </div>
      <PacksGrid />
      <AdSlot placement="home_mid" className="px-4" />
      <LatestGuides />
      <AdSlot placement="home_bottom" className="px-4" />
      <Faq />
      <section className="mx-auto max-w-3xl px-4 pb-6 text-center">
        <h2 className="text-3xl font-extrabold">Ready to find your real besties?</h2>
        <ButtonLink href="/create" variant="gradient" size="xl" className="mt-5 w-full sm:w-auto">
          Create my quiz
        </ButtonLink>
      </section>
    </>
  );
}
