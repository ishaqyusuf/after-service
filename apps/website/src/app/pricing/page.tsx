import type { Metadata } from "next";
import { LandingFooter } from "../../components/landing/footer";
import { LandingHeader } from "../../components/landing/header";
import { LandingPricing } from "../../components/landing/pricing";
import { createPageMetadata } from "../../lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Pricing | afterservice",
    description:
      "Free early access now, with simple paid plans planned for service teams.",
    path: "/pricing",
  });
}

export default async function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <LandingPricing />
      <LandingFooter />
    </main>
  );
}
