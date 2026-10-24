import type { Metadata } from "next";
import { PageHero } from "../../components/landing/page-hero";
import { LandingPricing } from "../../components/landing/pricing";
import { pricingFaqs } from "../../components/landing/pricing-faqs";
import { SeoFaq } from "../../components/seo-faq";
import { getPricingResolution } from "../../lib/pricing-request";
import { createPageMetadata } from "../../lib/seo";

type PricingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Pricing | afterservice",
    description:
      "Choose Free or affordable Business pricing, with an AI assistant and WhatsApp operations coming soon.",
    path: "/pricing",
  });
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const initialPricing = await getPricingResolution(searchParams);

  return (
    <main>
      <PageHero
        title="Free to start. Business when your team needs room."
        body="Free covers the whole follow-up workflow for one person. Business gives a small team more room, for one monthly price per business."
      />
      <LandingPricing initialPricing={initialPricing} showIntro={false} />
      <SeoFaq
        id="pricing-questions"
        items={pricingFaqs}
        title="Pricing questions"
        className="border-t border-border"
      />
    </main>
  );
}
