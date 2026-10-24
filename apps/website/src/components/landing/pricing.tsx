"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import {
  getLocalizedPlanPrice,
  type PricingResolution,
} from "@afterservice/plans";
import {
  getPricingBusinessPath,
  getPricingSignupPath,
} from "@afterservice/plans/checkout";
import { Badge, Button, Card } from "@afterservice/ui";
import { Check, Clock3 } from "lucide-react";
import { publicPlans } from "./pricing-data";

type LandingPricingProps = {
  initialPricing: PricingResolution;
};

export function LandingPricing({ initialPricing }: LandingPricingProps) {
  const pricing = initialPricing;
  const track = useTrack();

  return (
    <section
      id="pricing"
      className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 py-24"
    >
      <div className="text-center mb-14">
        <span className="text-xs font-bold text-primary tracking-widest uppercase">
          Free and Business
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mt-3 mb-4">
          Simple plans for small service businesses.
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start with Free or get more room with Business. One affordable monthly
          price, with AI assistance and WhatsApp operations coming soon.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Prices shown in {pricing.currency}, including applicable taxes.
        </p>
        {pricing.region === "OTHER" && (
          <p className="mt-6 text-xs text-muted-foreground">{pricing.note}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch max-w-4xl mx-auto">
        {publicPlans.map((plan) => {
          const price = getLocalizedPlanPrice(plan.id, pricing);

          return (
            <Card
              key={plan.name}
              className={`p-6 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none backdrop-blur-sm ${
                plan.current
                  ? "border-2 border-[#009b98] bg-primary/5"
                  : "bg-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase">
                    {plan.current ? "Start here" : "More room"}
                  </span>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {plan.buyer}
                  </span>
                </div>

                <h3 className="text-2xl font-bold mt-4 text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 min-h-16">
                  {plan.description}
                </p>

                <div className="my-6">
                  <span className="text-5xl font-extrabold text-foreground">
                    {price.formattedMonthly}
                  </span>
                  <span className="block text-sm text-muted-foreground mt-1">
                    {plan.priceNote}
                  </span>
                  {!plan.current ? (
                    <span className="block text-xs text-muted-foreground mt-1">
                      Monthly billing only.
                    </span>
                  ) : null}
                </div>

                <div className="border-t border-border pt-5">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                    Includes
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-start gap-2.5"
                      >
                        {feature.comingSoon ? (
                          <Clock3 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        ) : (
                          <Check
                            className="w-4 h-4 text-primary shrink-0 mt-0.5"
                            strokeWidth={3}
                          />
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span>{feature.name}</span>
                            {feature.comingSoon ? (
                              <Badge variant="outline">Coming soon</Badge>
                            ) : null}
                          </div>
                          {feature.description ? (
                            <p className="mt-1 text-xs leading-relaxed">
                              {feature.description}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border pt-5 mt-5">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
                    Limits
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {plan.limits.map((limit) => (
                      <li key={limit}>{limit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {plan.current ? (
                  <Button
                    asChild
                    className="w-full h-12 font-bold shadow-md shadow-[#009b98]/20"
                  >
                    <a
                      href={getPricingSignupPath(pricing)}
                      onClick={() =>
                        track({
                          event: LogEvents.JoinFreeBeta.name,
                          channel: LogEvents.JoinFreeBeta.channel,
                          location: "pricing_card",
                          plan: plan.name,
                        })
                      }
                    >
                      {plan.cta}
                    </a>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 text-primary font-bold"
                  >
                    <a href={getPricingBusinessPath(pricing)}>{plan.cta}</a>
                  </Button>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  {plan.billingNote}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        AI and WhatsApp features are coming soon. Business will include a shared
        AI usage allowance, with limits announced before launch.
        Customer-message delivery, when available, is charged separately.
      </p>
    </section>
  );
}
