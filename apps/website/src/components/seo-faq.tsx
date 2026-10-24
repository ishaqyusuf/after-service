import { cn } from "@afterservice/ui";
import { ChevronDown } from "lucide-react";
import { SectionHeading } from "./landing/section-heading";

export type SeoFaqItem = {
  answer: string;
  question: string;
};

export function SeoFaqList({ items }: { items: SeoFaqItem[] }) {
  return (
    <div className="max-w-[860px] border-t border-border">
      {items.map((item) => (
        <details className="group border-b border-border" key={item.question}>
          <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-[17px] font-semibold leading-snug hover:text-accent-foreground [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <ChevronDown
              className="wp-tertiary size-[18px] flex-none transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="max-w-[68ch] pb-[18px] text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function SeoFaq({
  className,
  id = "questions",
  items,
  title = "Common questions",
}: {
  className?: string;
  id?: string;
  items: SeoFaqItem[];
  title?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("py-[clamp(56px,8vw,104px)]", className)}
    >
      <div className="wp-wrap">
        <SectionHeading id={`${id}-title`}>{title}</SectionHeading>
        <div className="mt-7">
          <SeoFaqList items={items} />
        </div>
      </div>
    </section>
  );
}
