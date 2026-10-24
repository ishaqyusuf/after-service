import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/json-ld";
import { getFeatureSpec } from "../../../components/landing/feature-catalog";
import { NumberedSteps } from "../../../components/landing/numbered-steps";
import { PageHero } from "../../../components/landing/page-hero";
import { RuledColumns } from "../../../components/landing/ruled-columns";
import { SecondaryLink } from "../../../components/landing/secondary-link";
import { SectionHeading } from "../../../components/landing/section-heading";
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
  featurePages,
  getFeaturePage,
  solutionPages,
} from "../../../lib/seo-content";

type FeaturePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return featurePages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: FeaturePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getFeaturePage(slug);

  if (!page) return {};

  return createPageMetadata({
    description: page.description,
    path: page.path,
    title: page.title,
  });
}

export default async function FeatureDetailPage({ params }: FeaturePageProps) {
  const { slug } = await params;
  const page = getFeaturePage(slug);

  if (!page) {
    notFound();
  }

  const Spec = getFeatureSpec(page.path);

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Features", path: "/features" },
            { name: page.title, path: page.path },
          ]),
          faqJsonLd(page.faqs),
        ]}
      />
      <PageHero
        crumbs={[{ href: "/features", label: "Features" }]}
        title={pageTitle(page.title)}
        body={page.description}
      >
        <div className="flex flex-wrap gap-3">
          <StartFreeLink location={`feature_${page.slug}_hero`} />
          <SecondaryLink href="/guides/post-job-follow-up">
            Read the checklist
          </SecondaryLink>
        </div>
      </PageHero>

      <section
        aria-labelledby="highlights-title"
        className="py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap grid items-center gap-x-12 gap-y-8 min-[961px]:grid-cols-2">
          <div>
            <SectionHeading id="highlights-title">
              What it keeps in view
            </SectionHeading>
            <ul className="mt-6 grid gap-3">
              {page.highlights.map((highlight) => (
                <li
                  className="flex items-start gap-2.5 text-[16.5px]"
                  key={highlight}
                >
                  <Check
                    className="mt-1 size-[18px] flex-none text-accent-foreground"
                    aria-hidden="true"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          {Spec ? <Spec /> : null}
        </div>
      </section>

      <section
        aria-labelledby="workflow-title"
        className="border-y border-border bg-secondary py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="workflow-title">
            How the workflow works
          </SectionHeading>
          <NumberedSteps className="mt-8" steps={page.workflow} />
        </div>
      </section>

      <section
        aria-labelledby="notes-title"
        className="py-[clamp(56px,8vw,104px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="notes-title">
            Practical operating notes
          </SectionHeading>
          <RuledColumns
            className="mt-8"
            items={page.practicalNotes.map((note) => ({
              body: note.body,
              title: note.title,
            }))}
          />
        </div>
      </section>

      <SeoFaq items={page.faqs} className="pt-0" />

      <section
        aria-labelledby="teams-title"
        className="border-t border-border bg-secondary py-[clamp(48px,6vw,80px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="teams-title">Common service teams</SectionHeading>
          <RuledColumns
            className="mt-8"
            columns={2}
            surface="secondary"
            items={solutionPages.map((solution) => ({
              href: solution.path,
              title: solution.audience,
            }))}
          />
        </div>
      </section>

      <ClosingSection location={`feature_${page.slug}_bottom`} />
    </main>
  );
}
