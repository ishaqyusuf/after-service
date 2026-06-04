import type { Metadata } from "next";
import { LandingFooter } from "../../components/landing/footer";
import { LandingHeader } from "../../components/landing/header";
import { LandingPricing } from "../../components/landing/pricing";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pricing | afterservice",
    description:
      "Free early access now, with simple paid plans planned for service teams.",
  };
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
