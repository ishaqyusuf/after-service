/* biome-ignore-all lint/a11y/noSvgWithoutTitle: Inline icons are decorative and paired with visible text. */
/* biome-ignore-all lint/a11y/useValidAnchor: Hash links navigate to page sections and close the mobile menu. */

import { LandingCTA } from "./landing/cta";
import { LandingFAQ } from "./landing/faq";
import { LandingFeatures } from "./landing/features";
import { LandingFooter } from "./landing/footer";
import { LandingHeader } from "./landing/header";
import { LandingHero } from "./landing/hero";
import { LandingHowItWorks } from "./landing/how-it-works";
import { LandingMetrics } from "./landing/metrics";
import { LandingPricing } from "./landing/pricing";

export function LaunchedPage() {
  return (
    <div className="fullscreen-landing relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Background radial gradients for high-end glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary opacity-[0.03] dark:opacity-[0.07] blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary opacity-[0.02] dark:opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-primary opacity-[0.02] dark:opacity-[0.06] blur-[150px] pointer-events-none" />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <LandingHeader />
      <LandingHero />
      <LandingMetrics />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
