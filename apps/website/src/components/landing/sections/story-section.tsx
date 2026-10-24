import { storySteps } from "../landing-content";
import { SectionHeading } from "../section-heading";

export function StorySection() {
  return (
    <section
      id="story"
      aria-labelledby="story-title"
      className="border-y border-border bg-secondary py-[clamp(56px,8vw,104px)]"
    >
      <div className="wp-wrap">
        <SectionHeading id="story-title">
          The job ends. The care carries on.
        </SectionHeading>
        <ol className="mt-9 grid overflow-hidden rounded-[14px] border border-border bg-card md:grid-cols-3">
          {storySteps.map((step, index) => (
            <li
              className="border-b border-border px-6 pb-[26px] pt-[22px] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              key={step.title}
            >
              <span
                className="wp-display block text-[34px] leading-none text-accent-foreground [font-variant-numeric:tabular-nums]"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <h3 className="mt-1.5 text-[19px] font-semibold leading-snug">
                {step.title}
              </h3>
              <p className="mt-1.5 max-w-[46ch] text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
