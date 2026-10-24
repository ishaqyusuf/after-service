import Link from "next/link";
import { audiences, notFor } from "../landing-content";
import { SectionHeading } from "../section-heading";

export function AudienceSection() {
  return (
    <section
      id="people"
      aria-labelledby="audience-title"
      className="pb-[clamp(56px,8vw,104px)]"
    >
      <div className="wp-wrap">
        <SectionHeading id="audience-title">
          For businesses whose work keeps going after the visit.
        </SectionHeading>
        <ul className="mt-9 grid gap-px border-t-2 border-foreground bg-border min-[561px]:grid-cols-2 min-[1041px]:grid-cols-4">
          {audiences.map((audience) => (
            <li
              className="grid content-start gap-2.5 bg-background py-5 min-[561px]:px-5 min-[561px]:first:pl-0 min-[561px]:[&:nth-child(3)]:pl-0 min-[1041px]:[&:nth-child(3)]:pl-5"
              key={audience.name}
            >
              <h3 className="text-[17px] font-semibold leading-snug">
                <Link
                  href={audience.href}
                  className="hover:text-accent-foreground hover:underline"
                >
                  {audience.name}
                </Link>
              </h3>
              <p className="wp-display text-[19px] leading-[1.35] text-accent-foreground">
                {audience.ask}
              </p>
              <p className="text-[15px] text-muted-foreground">
                {audience.text}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-7 max-w-[70ch] text-[15.5px] text-muted-foreground">
          {notFor}
        </p>
      </div>
    </section>
  );
}
