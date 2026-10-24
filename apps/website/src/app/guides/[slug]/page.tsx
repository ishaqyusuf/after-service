import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/json-ld";
import { PageHero } from "../../../components/landing/page-hero";
import { RuledColumns } from "../../../components/landing/ruled-columns";
import { SectionHeading } from "../../../components/landing/section-heading";
import { StartFreeLink } from "../../../components/landing/start-free-link";
import { SeoFaqList } from "../../../components/seo-faq";
import { pageTitle } from "../../../lib/page-title";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  createPageMetadata,
  faqJsonLd,
} from "../../../lib/seo";
import {
  getGuidePage,
  guidePages,
  solutionPages,
} from "../../../lib/seo-content";

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guidePages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getGuidePage(slug);

  if (!page) return {};

  return createPageMetadata({
    description: page.description,
    path: page.path,
    title: page.title,
  });
}

const guideTitleClass =
  "wp-display text-[clamp(24px,2.8vw,30px)] leading-[1.2] tracking-[-0.012em]";

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const page = getGuidePage(slug);

  if (!page) {
    notFound();
  }

  const contents = [
    ...page.sections.map((section, index) => ({
      id: `section-${index + 1}`,
      label: section.title.replace(/^\d+\.\s*/, ""),
    })),
    { id: "guide-questions", label: "Questions" },
  ];

  return (
    <main>
      <JsonLd
        data={[
          articleJsonLd({
            description: page.description,
            path: page.path,
            title: page.title,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/features" },
            { name: page.title, path: page.path },
          ]),
          faqJsonLd(page.faqs),
        ]}
      />
      <PageHero
        crumbs={[{ href: "/features", label: "Features" }]}
        title={pageTitle(page.title)}
        body={page.intro}
      />

      <div className="wp-wrap grid items-start gap-7 py-[clamp(40px,6vw,72px)] min-[961px]:grid-cols-[240px_minmax(0,1fr)] min-[961px]:gap-14">
        <nav
          aria-labelledby="contents-title"
          className="grid gap-2.5 rounded-[14px] border border-border p-4 min-[961px]:sticky min-[961px]:top-[calc(var(--wp-header-h)+24px)] min-[961px]:rounded-none min-[961px]:border-0 min-[961px]:p-0"
        >
          <h2 id="contents-title" className="wp-tertiary text-[13px] font-bold">
            Contents
          </h2>
          <ol className="grid gap-0.5">
            {contents.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="flex min-h-10 items-center rounded-lg px-2.5 py-1.5 text-[15px] leading-snug text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article
          aria-label={pageTitle(page.title)}
          className="grid max-w-[70ch] gap-11 text-[16.5px] leading-[1.7] sm:text-[17.5px]"
        >
          {page.sections.map((section, index) => (
            <section
              aria-labelledby={`section-${index + 1}`}
              className="grid gap-3.5"
              key={section.title}
            >
              <h2 id={`section-${index + 1}`} className={guideTitleClass}>
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p className="text-muted-foreground" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.checklist ? (
                <ul className="grid gap-2 rounded-[14px] bg-muted px-[18px] py-4 text-[15.5px] leading-normal">
                  {section.checklist.map((item) => (
                    <li className="flex items-start gap-2.5" key={item}>
                      <Check
                        className="mt-[3px] size-[18px] flex-none text-accent-foreground"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.example ? (
                <div className="grid max-w-[52ch] gap-1.5 rounded-[4px_16px_16px_16px] border border-border bg-muted px-[15px] py-3 leading-normal">
                  <p className="wp-tertiary text-[12.5px] font-semibold">
                    Example message
                  </p>
                  <p className="text-[15.5px] text-foreground">
                    {section.example}
                  </p>
                </div>
              ) : null}
            </section>
          ))}

          <section aria-labelledby="guide-questions" className="grid gap-3.5">
            <h2 id="guide-questions" className={guideTitleClass}>
              Questions
            </h2>
            <div className="text-base leading-relaxed">
              <SeoFaqList items={page.faqs} />
            </div>
          </section>

          <div className="grid justify-items-start gap-3 rounded-[14px] bg-muted p-7 text-base leading-relaxed">
            <SectionHeading>Try the checklist in afterservice.</SectionHeading>
            <p className="text-muted-foreground">
              Record one finished job, give the check-in an owner and a date,
              and log what the customer says.
            </p>
            <StartFreeLink location={`guide_${page.slug}_end`} />
          </div>
        </article>
      </div>

      <section
        aria-labelledby="operators-title"
        className="border-t border-border bg-secondary py-[clamp(48px,6vw,80px)]"
      >
        <div className="wp-wrap">
          <SectionHeading id="operators-title">
            Built for service operators
          </SectionHeading>
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
    </main>
  );
}
