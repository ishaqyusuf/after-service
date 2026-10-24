import { reminderGaps } from "../landing-content";
import { SectionHeading, SectionLede } from "../section-heading";

export function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-title"
      className="py-[clamp(56px,8vw,104px)]"
    >
      <div className="wp-wrap grid items-end gap-x-16 gap-y-8 min-[901px]:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading id="problem-title">
            Follow-ups go missing in the gaps between people.
          </SectionHeading>
          <SectionLede>
            After the job, the reminder lives in someone’s head, a notebook, a
            calendar, a spreadsheet or a WhatsApp thread. When that person is
            busy or off, nobody calls, and the customer’s next problem reaches
            you as a complaint instead of a conversation.
          </SectionLede>
        </div>
        <div className="rounded-[14px] border border-border bg-card p-5">
          <p className="wp-tertiary text-sm font-semibold">
            Where the reminder lives today
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {reminderGaps.map((gap) => (
              <li
                className="wp-struck rounded-full border border-input px-3 py-1.5 text-[15px] text-muted-foreground"
                key={gap}
              >
                {gap}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
