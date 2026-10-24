import { cn } from "@afterservice/ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BoardSpec, HistorySpec, LogSpec, TemplateSpec } from "./feature-specs";

type CatalogFeature = {
  id: string;
  title: string;
  text: string;
  steps?: string[];
  limit?: string;
  href?: string;
  spec: () => ReactNode;
};

export const featureCatalog: CatalogFeature[] = [
  {
    id: "board",
    title: "Follow-up board",
    text: "Five stages from Due today to Closed. Every item shows the customer, the job it came from, the channel and the owner.",
    steps: [
      "Create a follow-up from a completed job",
      "Choose purpose, owner, channel and date",
      "Work due items and record the contact or reply",
      "Close the loop or plan the next action",
    ],
    href: "/features/follow-up-board",
    spec: BoardSpec,
  },
  {
    id: "templates",
    title: "Templates",
    text: "Reusable drafts for check-ins, issue acknowledgements, honest review requests and service reminders. Fields such as {{customer.name}} and {{job.title}} fill in from the job; staff read and edit before sending.",
    limit: "Free plan: 5 templates. Business: 25.",
    href: "/features/templates",
    spec: TemplateSpec,
  },
  {
    id: "history",
    title: "Customer history",
    text: "Contact details, completed jobs, follow-ups, contact logs and replies together. Whoever calls next reads the context first.",
    href: "/features/customer-history",
    spec: HistorySpec,
  },
  {
    id: "logging",
    title: "Contact and reply logging",
    text: "Record who was contacted, how, and what they said. A sent message is activity; the reply is the outcome.",
    spec: LogSpec,
  },
];

export function getFeatureSpec(href: string) {
  return featureCatalog.find((feature) => feature.href === href)?.spec;
}

export function FeatureList() {
  return (
    <div className="wp-wrap grid gap-[clamp(40px,6vw,72px)] py-[clamp(40px,6vw,72px)]">
      {featureCatalog.map((feature, index) => {
        const Spec = feature.spec;
        return (
          <article
            aria-labelledby={`feature-${feature.id}`}
            className="grid items-center gap-x-12 gap-y-8 min-[961px]:grid-cols-2"
            id={feature.id}
            key={feature.id}
          >
            <div className={cn(index % 2 === 1 && "min-[961px]:order-2")}>
              <h2
                id={`feature-${feature.id}`}
                className="wp-display text-[clamp(26px,3vw,34px)] leading-[1.15] tracking-[-0.015em]"
              >
                {feature.title}
              </h2>
              <p className="mt-3 max-w-[54ch] text-[17px] text-muted-foreground">
                {feature.text}
              </p>
              {feature.steps ? (
                <ol className="mt-4 grid gap-2">
                  {feature.steps.map((step, stepIndex) => (
                    <li className="flex gap-2.5 text-[15.5px]" key={step}>
                      <span
                        aria-hidden="true"
                        className="grid size-6 flex-none place-items-center rounded-full bg-accent text-[13px] font-bold text-accent-foreground"
                      >
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : null}
              {feature.limit ? (
                <p className="mt-3.5 text-[14.5px] font-semibold text-muted-foreground">
                  {feature.limit}
                </p>
              ) : null}
              {feature.href ? (
                <Link
                  href={feature.href}
                  className="group mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-accent-foreground"
                >
                  <span className="group-hover:underline">
                    More about {feature.title.toLowerCase()}
                  </span>
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              ) : null}
            </div>
            <Spec />
          </article>
        );
      })}
    </div>
  );
}
