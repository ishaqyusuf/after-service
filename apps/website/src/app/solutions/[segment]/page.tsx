import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/json-ld";
import { CadenceTimeline } from "../../../components/landing/cadence-timeline";
import { NumberedSteps } from "../../../components/landing/numbered-steps";
import { PageHero } from "../../../components/landing/page-hero";
import { RuledColumns } from "../../../components/landing/ruled-columns";
import { SecondaryLink } from "../../../components/landing/secondary-link";
import {
  SectionHeading,
  SectionLede,
} from "../../../components/landing/section-heading";
import { ClosingSection } from "../../../components/landing/sections/closing-section";
import { StartFreeLink } from "../../../components/landing/start-free-link";
import { SeoFaq } from "../../../components/seo-faq";
import { pageTitle } from "../../../lib/page-title";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
} from "../../../lib/seo";
import {
  getSolutionPage,
  guidePages,
  solutionPages,
} from "../../../lib/seo-content";

type SolutionPageProps = {
  params: Promise<{
    segment: string;
  }>;
};

export function generateStaticParams() {
  return solutionPages.map((page) => ({
    segment: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: SolutionPageProps): Promise<Metadata> {
  const { segment } = await params;
  const page = getSolutionPage(segment);

  if (!page) return {};

  return createPageMetadata({
    description: page.description,
    path: page.path,
    title: page.title,
  });
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const { segment } = await params;
  const page = getSolutionPage(segment);

  if (!page) {
    notFound();
  }

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/features" },
            { name: page.audience, path: page.path },
          ]),
          faqJsonLd(page.faqs),
        ]}
      />
      <PageHero
        crumbs={[{ href: "/features", label: "Features" }]}
        title={page.hero}
        body={page.description}
      >
        <div className="flex flex-wrap gap-3">
          <StartFreeLink location={`solution_${page.slug}_hero`} />
          <SecondaryLink href="/guides/post-job-follow-up">
            Read the follow-up checklist
          </SecondaryLink>
        </div>
      </PageHero>

      <section
        aria-labelledby="pain-title"
        className="py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap grid items-end gap-x-16 gap-y-8 min-[901px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div>
            <SectionHeading id="pain-title">
              Why follow-up breaks
            </SectionHeading>
            <SectionLede>{page.pain}</SectionLede>
          </div>
          <ul className="grid gap-3 rounded-[14px] border border-border bg-card p-5">
            {page.outcomes.map((outcome) => (
              <li
                className="flex items-start gap-2.5 text-[15.5px]"
                key={outcome}
              >
                <Check
                  className="mt-1 size-[18px] flex-none text-accent-foreground"
                  aria-hidden="true"
                />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="cadence-title"
        className="border-y border-border bg-secondary py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="cadence-title">
            A practical follow-up cadence
          </SectionHeading>
          <CadenceTimeline className="mt-8" items={page.cadence} />
        </div>
      </section>

      <section
        aria-labelledby="workflow-title"
        className="py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="workflow-title">
            A manual-first workflow your team can repeat
          </SectionHeading>
          <NumberedSteps className="mt-8" steps={page.workflows} />
        </div>
      </section>

      <SeoFaq items={page.faqs} className="pt-0" />

      <section
        aria-labelledby="guides-title"
        className="border-t border-border py-[clamp(48px,6vw,80px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="guides-title">Related guides</SectionHeading>
          <RuledColumns
            className="mt-8"
            items={guidePages.map((guide) => ({
              body: guide.description,
              href: guide.path,
              title: pageTitle(guide.title),
            }))}
          />
        </div>
      </section>

      <ClosingSection location={`solution_${page.slug}_bottom`} />
    </main>
  );
}
