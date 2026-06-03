"use client";

import { Button, Card, CardContent, CardHeader } from "@afterservice/ui";
import { Check } from "lucide-react";
import { useState } from "react";

export function LandingPricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly",
  );

  return (
    <section
      id="pricing"
      className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 py-24"
    >
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
          Transparent, ROI-Driven Pricing
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Choose the plan that matches your business size. Save 20% by billing
          annually.
        </p>

        {/* Pricing Cycle Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-card border border-border mb-12 shadow-sm">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-[#18211c] dark:hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annually")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              billingCycle === "annually"
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-[#18211c] dark:hover:text-white"
            }`}
          >
            Annually (Save 20%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
        {/* Plan 1 */}
        <Card className="p-8 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none backdrop-blur-sm bg-card">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase">
              STARTER
            </span>
            <h3 className="text-2xl font-bold mt-2 text-foreground">
              Starter Plan
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Perfect for independent owner-operators.
            </p>

            <div className="my-6">
              <span className="text-5xl font-extrabold text-foreground">
                ${billingCycle === "monthly" ? "49" : "39"}
              </span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </div>

            <ul className="space-y-3.5 text-sm text-muted-foreground border-t border-border pt-6">
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Up to 100 customers
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Email follow-ups
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Standard review routing
              </li>
              <li className="flex items-center gap-2.5 opacity-40">
                <Check
                  className="w-4 h-4 text-zinc-500 shrink-0"
                  strokeWidth={3}
                />
                SMS check-ins
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <a href="/signup" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-12 text-primary font-bold"
              >
                Get Started
              </Button>
            </a>
          </div>
        </Card>

        {/* Plan 2 - Featured */}
        <Card className="border-2 border-[#009b98] p-8 rounded-2xl flex flex-col justify-between relative shadow-lg dark:shadow-2xl dark:shadow-primary/10 transform md:-translate-y-2 bg-card">
          <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full tracking-wider">
            MOST POPULAR
          </span>
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase">
              GROWTH
            </span>
            <h3 className="text-2xl font-bold mt-2 text-foreground">
              Growth Plan
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Ideal for expanding residential teams.
            </p>

            <div className="my-6">
              <span className="text-5xl font-extrabold text-foreground">
                ${billingCycle === "monthly" ? "99" : "79"}
              </span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </div>

            <ul className="space-y-3.5 text-sm text-muted-foreground border-t border-border pt-6">
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Up to 1,000 customers
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                SMS & Email outreach
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Private dispute resolver
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Up to 5 team seats
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <a href="/signup" className="block w-full">
              <Button className="w-full h-12 font-bold shadow-md shadow-[#009b98]/20">
                Start Free Trial
              </Button>
            </a>
          </div>
        </Card>

        {/* Plan 3 */}
        <Card className="p-8 rounded-2xl flex flex-col justify-between shadow-sm dark:shadow-none backdrop-blur-sm bg-card">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase">
              PRO
            </span>
            <h3 className="text-2xl font-bold mt-2 text-foreground">
              Pro Plan
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Built for multi-region operators.
            </p>

            <div className="my-6">
              <span className="text-5xl font-extrabold text-foreground">
                ${billingCycle === "monthly" ? "199" : "159"}
              </span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </div>

            <ul className="space-y-3.5 text-sm text-muted-foreground border-t border-border pt-6">
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Unlimited customers
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                All messaging channels
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Advanced automation hooks
              </li>
              <li className="flex items-center gap-2.5">
                <Check
                  className="w-4 h-4 text-primary shrink-0"
                  strokeWidth={3}
                />
                Unlimited team seats
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <a href="/signup" className="block w-full">
              <Button
                variant="outline"
                className="w-full h-12 text-primary font-bold"
              >
                Get Started
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
}
