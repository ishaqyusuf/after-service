import { Check, Clock3 } from "lucide-react";
import { availability } from "../landing-content";
import { SectionHeading, SectionLede } from "../section-heading";

export function AvailabilitySection() {
  return (
    <section
      aria-labelledby="availability-title"
      className="border-y border-border bg-secondary py-[clamp(56px,8vw,104px)]"
    >
      <div className="wp-wrap">
        <SectionHeading id="availability-title">
          {availability.title}
        </SectionHeading>
        <SectionLede>{availability.body}</SectionLede>
        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[14px] border border-border bg-card px-[22px] py-5">
            <h3 className="mb-2.5 text-base font-semibold">Today</h3>
            <ul className="grid gap-2.5">
              {availability.today.map((item) => (
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
          <div className="rounded-[14px] border border-dashed border-input px-[22px] py-5">
            <h3 className="mb-2.5 text-base font-semibold">Planned</h3>
            <ul className="grid gap-2.5">
              {availability.planned.map((item) => (
                <li
                  className="flex items-center gap-2.5 text-[15.5px]"
                  key={item}
                >
                  <Clock3
                    className="wp-tertiary size-[18px] flex-none"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
