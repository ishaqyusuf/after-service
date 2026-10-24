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
import { Button, cn } from "@afterservice/ui";
import { Check, Clock3, Info } from "lucide-react";
import { publicPlans } from "./pricing-data";
import { SectionHeading, SectionLede } from "./section-heading";

type LandingPricingProps = {
  initialPricing: PricingResolution;
  showIntro?: boolean;
};

export function LandingPricing({
  initialPricing,
  showIntro = true,
}: LandingPricingProps) {
  const pricing = initialPricing;
  const track = useTrack();

  return (
    <section
      id="pricing"
      aria-labelledby={showIntro ? "pricing-title" : undefined}
      aria-label={showIntro ? undefined : "Plans"}
      className="py-[clamp(56px,8vw,104px)]"
    >
      <div className="wp-wrap grid gap-8">
        {showIntro ? (
          <div>
            <SectionHeading id="pricing-title">
              Free to start. Business when your team needs room.
            </SectionHeading>
            <SectionLede>
              Free covers the whole follow-up workflow for one person. Business
              gives a small team more room, for one monthly price per business.
            </SectionLede>
          </div>
        ) : null}

        <div
          className={cn(
            "flex max-w-[70ch] items-start gap-2.5 text-[15px] text-muted-foreground",
            pricing.region === "OTHER" &&
              "rounded-[10px] border border-dashed border-input px-3.5 py-2.5",
          )}
        >
          <Info
            className="mt-[3px] size-[18px] flex-none text-accent-foreground"
            aria-hidden="true"
          />
          <p>
            Prices shown in {pricing.currency}, including applicable taxes.
            {pricing.region === "OTHER" && pricing.note ? (
              <> {pricing.note}</>
            ) : null}
          </p>
        </div>

        <div className="grid max-w-[920px] gap-5 md:grid-cols-2">
          {publicPlans.map((plan) => {
            const price = getLocalizedPlanPrice(plan.id, pricing);

            return (
              <article
                key={plan.name}
                aria-labelledby={`plan-${plan.id}`}
                className={cn(
                  "grid content-start gap-3.5 rounded-[14px] border bg-card p-5 text-card-foreground sm:p-[26px]",
                  plan.current
                    ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary)),var(--wp-shadow)]"
                    : "border-border",
                )}
              >
                <header className="flex items-center justify-between gap-3">
                  <h3
                    id={`plan-${plan.id}`}
                    className="wp-display text-[28px] leading-[1.1]"
                  >
                    {plan.name}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
                      plan.current
                        ? "bg-accent text-accent-foreground"
                        : "border border-input text-muted-foreground",
                    )}
                  >
                    {plan.buyer}
                  </span>
                </header>

                <p className="text-muted-foreground">{plan.description}</p>

                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="wp-display text-[44px] leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums]">
                    {price.formattedMonthly}
                  </span>
                  <span className="wp-tertiary w-full text-sm">
                    {plan.priceNote}
                    {plan.current ? null : " · Monthly billing only"}
                  </span>
                </p>

                {plan.current ? (
                  <Button
                    asChild
                    className="h-11 w-full rounded-[10px] text-[15px] font-semibold"
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
                    className="h-11 w-full rounded-[10px] border-input bg-card text-[15px] font-semibold text-foreground"
                  >
                    <a href={getPricingBusinessPath(pricing)}>{plan.cta}</a>
                  </Button>
                )}
                <p className="wp-tertiary text-[13.5px]">{plan.billingNote}</p>

                <ul className="grid gap-2.5 pt-1.5">
                  {plan.features.map((feature) => (
                    <li className="flex items-start gap-2.5" key={feature.name}>
                      {feature.comingSoon ? (
                        <Clock3
                          className="wp-tertiary mt-[3px] size-[18px] flex-none"
                          aria-hidden="true"
                        />
                      ) : (
                        <Check
                          className="mt-[3px] size-[18px] flex-none text-accent-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <div className="min-w-0 text-[15.5px]">
                        <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          {feature.name}
                          {feature.comingSoon ? (
                            <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full border border-dashed border-input px-2.5 text-xs font-semibold text-muted-foreground">
                              Coming soon
                            </span>
                          ) : null}
                        </span>
                        {feature.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>

                <ul className="grid" aria-label={`${plan.name} limits`}>
                  {plan.limits.map((limit) => (
                    <li
                      className="border-t border-border py-[9px] text-[15px] text-muted-foreground [font-variant-numeric:tabular-nums]"
                      key={limit}
                    >
                      {limit}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="grid max-w-[70ch] gap-2 text-sm text-muted-foreground">
          <p>Limits count stored records, not messages sent each month.</p>
          <p>
            AI and WhatsApp features are coming soon. Business will include a
            shared AI usage allowance, with limits announced before launch.
            Customer-message delivery, when available, is charged separately.
          </p>
        </div>
      </div>
    </section>
  );
}
