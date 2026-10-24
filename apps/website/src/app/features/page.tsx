import { Check, Clock3 } from "lucide-react";
import type { Metadata } from "next";
import { JsonLd } from "../../components/json-ld";
import { FeatureList } from "../../components/landing/feature-catalog";
import { PageHero } from "../../components/landing/page-hero";
import { publicPlans } from "../../components/landing/pricing-data";
import { RuledColumns } from "../../components/landing/ruled-columns";
import { SectionHeading } from "../../components/landing/section-heading";
import { ClosingSection } from "../../components/landing/sections/closing-section";
import { StartFreeLink } from "../../components/landing/start-free-link";
import { pageTitle } from "../../lib/page-title";
import { breadcrumbJsonLd, createPageMetadata } from "../../lib/seo";
import { guidePages, solutionPages } from "../../lib/seo-content";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Features | afterservice",
    description:
      "Follow-up workflows for completed jobs, customer check-ins, templates, and manual outreach logs.",
    path: "/features",
  });
}

const included = [
  "Phone and desktop",
  "A default follow-up delay, set during workspace setup",
];

const planned = [
  "Connected SMS and WhatsApp delivery",
  "Automation rules",
  "CSV import",
];

const comingSoon = publicPlans.flatMap((plan) =>
  plan.features.filter((feature) => feature.comingSoon),
);

export default async function FeaturesPage() {
  return (
    <main>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Features", path: "/features" },
        ])}
      />
      <PageHero
        title="The follow-up tools a small service business uses every week."
        body="Four parts, all connected to the same customer record."
      >
        <StartFreeLink location="features_hero" />
      </PageHero>

      <FeatureList />

      <section
        aria-labelledby="also-title"
        className="border-t border-border bg-secondary py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap grid gap-6 sm:grid-cols-2">
          <div>
            <SectionHeading id="also-title" className="mb-4">
              Also included
            </SectionHeading>
            <ul className="grid gap-2.5">
              {included.map((item) => (
                <li
                  className="flex items-center gap-2.5 text-[15.5px]"
                  key={item}
                >
                  <Check
                    className="size-[18px] flex-none text-accent-foreground"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-base font-semibold sm:mt-3">
              Planned and coming soon
            </h3>
            <ul className="grid gap-2.5">
              {planned.map((item) => (
                <li
                  className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15.5px]"
                  key={item}
                >
                  <Clock3
                    className="wp-tertiary size-[18px] flex-none"
                    aria-hidden="true"
                  />
                  {item}
                  <span className="inline-flex h-6 items-center rounded-full border border-dashed border-input px-2.5 text-xs font-semibold text-muted-foreground">
                    Planned
                  </span>
                </li>
              ))}
              {comingSoon.map((feature) => (
                <li
                  className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15.5px]"
                  key={feature.name}
                >
                  <Clock3
                    className="wp-tertiary size-[18px] flex-none"
                    aria-hidden="true"
                  />
                  {feature.name}
                  <span className="inline-flex h-6 items-center rounded-full border border-dashed border-input px-2.5 text-xs font-semibold text-muted-foreground">
                    Coming soon
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="teams-title"
        className="py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="teams-title">
            Built around real service teams
          </SectionHeading>
          <RuledColumns
            className="mt-8"
            columns={2}
            items={solutionPages.map((page) => ({
              body: page.description,
              href: page.path,
              title: page.audience,
            }))}
          />

          <SectionHeading
            id="guides-title"
            className="mt-[clamp(48px,7vw,80px)]"
          >
            Practical guides
          </SectionHeading>
          <RuledColumns
            className="mt-8"
            items={guidePages.map((page) => ({
              body: page.description,
              href: page.path,
              title: pageTitle(page.title),
            }))}
          />
        </div>
      </section>

      <ClosingSection location="features_bottom" />
    </main>
  );
}
