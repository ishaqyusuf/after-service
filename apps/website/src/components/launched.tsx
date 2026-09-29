import type { PricingResolution } from "@afterservice/plans";
import { CareLanding } from "./landing/care-landing";
import { MobileLandingPrompts } from "./landing/mobile-landing-prompts";

export function LaunchedPage({
  initialPricing,
}: {
  initialPricing: PricingResolution;
}) {
  return (
    <div className="care-site">
      <CareLanding initialPricing={initialPricing} />
      <MobileLandingPrompts />
    </div>
  );
}
