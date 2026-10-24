import type { PricingResolution } from "@afterservice/plans";
import { SeoFaq } from "../seo-faq";
import { landingFaqs } from "./faq";
import { LandingPricing } from "./pricing";
import { AudienceSection } from "./sections/audience-section";
import { AvailabilitySection } from "./sections/availability-section";
import { BoardSection } from "./sections/board-section";
import { ClosingSection } from "./sections/closing-section";
import { HeroSection } from "./sections/hero-section";
import { ProblemSection } from "./sections/problem-section";
import { StorySection } from "./sections/story-section";

export function CareLanding({
  initialPricing,
}: {
  initialPricing: PricingResolution;
}) {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <StorySection />
      <BoardSection />
      <AudienceSection />
      <AvailabilitySection />
      <LandingPricing initialPricing={initialPricing} />
      <SeoFaq items={landingFaqs} className="pt-0" />
      <ClosingSection location="landing_bottom" />
    </main>
  );
}
