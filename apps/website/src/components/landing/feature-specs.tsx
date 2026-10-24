import { Reply, Send, User } from "lucide-react";
import type { ReactNode } from "react";
import { boardStages } from "./landing-content";
import { StageMark } from "./stage-mark";

// Illustrative product fragments for the features pages. Sample data only.

function SpecFrame({ children }: { children: ReactNode }) {
  return (
    <figure className="grid gap-3 rounded-[14px] border border-border bg-card p-[18px] text-card-foreground shadow-[var(--wp-shadow)]">
      <figcaption className="wp-tertiary text-[13px]">
        Illustrative example
      </figcaption>
      {children}
    </figure>
  );
}

export function BoardSpec() {
  return (
    <SpecFrame>
      <ul className="grid gap-2">
        {boardStages.map((stage) => (
          <li
            className="flex items-center justify-between gap-3 rounded-[10px] border border-border px-3 py-[9px]"
            key={stage.key}
          >
            <StageMark stage={stage.key} />
            <span className="truncate text-sm text-muted-foreground">
              {stage.who}
            </span>
          </li>
        ))}
      </ul>
    </SpecFrame>
  );
}

export function TemplateSpec() {
  return (
    <SpecFrame>
      <p className="text-[14.5px] font-semibold">
        Post-job check-in · WhatsApp
      </p>
      <p className="rounded-[10px] bg-muted px-3.5 py-3 text-[15px]">
        Hi{" "}
        <span className="font-semibold text-accent-foreground">
          {"{{customer_name}}"}
        </span>
        , how is everything since the{" "}
        <span className="font-semibold text-accent-foreground">
          {"{{service_name}}"}
        </span>
        ? Reply here if anything doesn’t feel right.
      </p>
      <p className="wp-tertiary text-[13px]">
        Filled from the job, then edited by staff
      </p>
      <p className="rounded-[10px] border border-border px-3.5 py-3 text-[15px]">
        Hi Amara, how is everything since the AC maintenance? Reply here if
        anything doesn’t feel right.
      </p>
    </SpecFrame>
  );
}

const history = [
  ["19 Oct", "Job #1048 · AC maintenance completed"],
  ["19 Oct", "Check-in planned for Thu 22 Oct"],
  ["22 Oct", "Contacted on WhatsApp by Tobi"],
  ["22 Oct", "Reply: “Much better, thanks for checking in.”"],
  ["22 Oct", "Closed: drain line reminder for next service"],
];

export function HistorySpec() {
  return (
    <SpecFrame>
      <p className="flex items-center gap-2 text-[14.5px] font-semibold">
        <User className="wp-tertiary size-[18px]" aria-hidden="true" />
        Amara Okeke · Brightline Cooling customer
      </p>
      <ol className="grid">
        {history.map(([when, what]) => (
          <li
            className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-t border-border py-[9px] text-[14.5px]"
            key={what}
          >
            <span className="wp-tertiary [font-variant-numeric:tabular-nums]">
              {when}
            </span>
            <span>{what}</span>
          </li>
        ))}
      </ol>
    </SpecFrame>
  );
}

export function LogSpec() {
  return (
    <SpecFrame>
      <dl className="grid gap-2.5">
        <div className="grid gap-1 rounded-[10px] border border-border px-3.5 py-3">
          <dt className="wp-tertiary flex items-center gap-2 text-[13px] font-bold">
            <Send className="size-[15px]" aria-hidden="true" />
            Activity
          </dt>
          <dd className="text-[15px]">
            Contacted on WhatsApp · Thu 22 Oct, 10:14
          </dd>
        </div>
        <div className="wp-reply-surface grid gap-1 rounded-[10px] px-3.5 py-3">
          <dt className="wp-tertiary flex items-center gap-2 text-[13px] font-bold">
            <Reply className="size-[15px]" aria-hidden="true" />
            Outcome
          </dt>
          <dd className="text-[15px]">
            Replied: “Much better, thanks for checking in. It’s cooling properly
            now.”
          </dd>
        </div>
      </dl>
    </SpecFrame>
  );
}
