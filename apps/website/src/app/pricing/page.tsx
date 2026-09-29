import type { Metadata } from "next";
import { LandingPricing } from "../../components/landing/pricing";
import { getPricingResolution } from "../../lib/pricing-request";
import { createPageMetadata } from "../../lib/seo";

type PricingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Pricing | afterservice",
    description:
      "Free early access now, with simple paid plans planned for service teams.",
    path: "/pricing",
  });
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const initialPricing = await getPricingResolution(searchParams);

  return (
    <main className="care-inner-page min-h-screen bg-background text-foreground">
      <div className="care-page-intro">
        <div className="care-wrap">
          <p className="care-eyebrow">A straightforward start</p>
          <h1>Good care starts here.</h1>
          <p>
            Start with the free beta. See what is available now and what is
            planned for later.
          </p>
        </div>
      </div>
      <LandingPricing initialPricing={initialPricing} />
    </main>
  );
}
