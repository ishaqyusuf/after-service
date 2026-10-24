import type { PricingResolution } from "@afterservice/plans";
import { CareLanding } from "./landing/care-landing";
import { MobileLandingPrompts } from "./landing/mobile-landing-prompts";

export function LaunchedPage({
  initialPricing,
}: {
  initialPricing: PricingResolution;
}) {
  return (
    <>
      <CareLanding initialPricing={initialPricing} />
      <MobileLandingPrompts />
    </>
  );
}
