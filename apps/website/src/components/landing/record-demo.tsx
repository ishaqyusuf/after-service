"use client";

import { BrandMark, cn } from "@afterservice/ui";
import {
  ArrowRight,
  CalendarDays,
  Info,
  Phone,
  Reply,
  StickyNote,
  Wrench,
} from "lucide-react";
import { type KeyboardEvent, type ReactNode, useRef, useState } from "react";
import { StageMark } from "./stage-mark";

const steps = [
  {
    key: "job",
    tab: "The job",
    caption: "The job is recorded with the details that matter.",
  },
  {
    key: "checkin",
    tab: "The check-in",
    caption: "A check-in is planned with a purpose and a date.",
  },
  {
    key: "reply",
    tab: "The reply",
    caption: "The reply stays with the customer, for whoever calls next.",
  },
] as const;

type StepKey = (typeof steps)[number]["key"];

const navigationKeys = [
  "ArrowRight",
  "ArrowLeft",
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
];

function RecordHead({
  icon,
  title,
  meta,
}: {
  icon: ReactNode;
  title: string;
  meta: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-10 flex-none place-items-center rounded-xl bg-muted text-accent-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-[19px] font-semibold leading-tight tracking-[-0.01em]">
          {title}
        </h3>
        <div className="mt-0.5 flex flex-wrap items-center text-sm text-muted-foreground">
          {meta}
        </div>
      </div>
    </div>
  );
}

function Facts({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div
          className="min-w-0 rounded-[10px] border border-border px-3 py-2.5"
          key={label}
        >
          <dt className="wp-tertiary text-[12.5px] font-semibold">{label}</dt>
          <dd className="break-words text-[15px] font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Bubble({
  label,
  text,
  reply = false,
}: {
  label: string;
  text: string;
  reply?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid max-w-[52ch] gap-1.5 rounded-[4px_16px_16px_16px] px-[15px] py-3",
        reply ? "wp-reply-surface" : "border border-border bg-muted",
      )}
    >
      <p className="wp-tertiary text-[12.5px] font-semibold">{label}</p>
      <p className="text-[15.5px] leading-normal text-foreground">{text}</p>
    </div>
  );
}

function Note({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-[14.5px] text-muted-foreground">
      <span className="wp-tertiary mt-[3px]">{icon}</span>
      <span>{children}</span>
    </p>
  );
}

function JobRecord() {
  return (
    <>
      <RecordHead
        icon={<Wrench className="size-[18px]" aria-hidden="true" />}
        title="AC maintenance"
        meta="Amara Okeke · Job #1048"
      />
      <Facts
        items={[
          ["Completed", "Mon 19 Oct"],
          ["Recorded by", "Tobi"],
          ["Next step", "Check-in planned"],
        ]}
      />
      <Note icon={<StickyNote className="size-[18px]" aria-hidden="true" />}>
        Filters cleaned, cooling checked. Unit is 6 years old; mention the drain
        line at next service.
      </Note>
    </>
  );
}

function CheckInRecord() {
  return (
    <>
      <RecordHead
        icon={<CalendarDays className="size-[18px]" aria-hidden="true" />}
        title="Check the repair is holding"
        meta={
          <>
            <StageMark stage="upcoming" className="text-[13.5px]" />
            <span>&nbsp;· Amara Okeke</span>
          </>
        }
      />
      <Facts
        items={[
          ["Due", "Thu 22 Oct"],
          ["Channel", "WhatsApp"],
          ["Owner", "Tobi"],
        ]}
      />
      <Bubble
        label="Draft from template · edit before sending"
        text="Hi Amara, this is Tobi from Brightline Cooling. How is the AC working since Monday’s service? Reply here if anything doesn’t feel right."
      />
      <Note icon={<Phone className="size-[18px]" aria-hidden="true" />}>
        You send it from your own phone. afterservice keeps the draft and the
        due date.
      </Note>
    </>
  );
}

function ReplyRecord() {
  return (
    <>
      <RecordHead
        icon={<Reply className="size-[18px]" aria-hidden="true" />}
        title="Amara replied"
        meta="Contacted Thu 22 Oct, 10:14 · WhatsApp · logged by Tobi"
      />
      <Bubble
        reply
        label="Reply recorded"
        text="Much better, thanks for checking in. It’s cooling properly now."
      />
      <div className="grid gap-2 rounded-[10px] border border-dashed border-input px-3.5 py-3">
        <p className="flex flex-wrap items-center gap-2.5">
          <StageMark stage="replied" />
          <ArrowRight className="wp-tertiary size-4" aria-hidden="true" />
          <StageMark stage="closed" />
        </p>
        <p className="text-[14.5px] text-muted-foreground">
          Closing note: No further issue. Drain line reminder for next service.
        </p>
      </div>
    </>
  );
}

const records: Record<StepKey, () => ReactNode> = {
  job: JobRecord,
  checkin: CheckInRecord,
  reply: ReplyRecord,
};

export function RecordDemo() {
  const [active, setActive] = useState<StepKey>("job");
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = steps.findIndex((step) => step.key === active);
  const current = steps[index] ?? steps[0];
  const ActiveRecord = records[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!navigationKeys.includes(event.key)) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? steps.length - 1
          : (index + (forward ? 1 : steps.length - 1)) % steps.length;
    const step = steps[next];
    if (!step) return;
    setActive(step.key);
    tabs.current[next]?.focus();
  };

  return (
    <div className="overflow-hidden rounded-[14px] border border-input bg-card text-card-foreground shadow-[var(--wp-shadow)]">
      <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5 text-[13.5px] font-semibold">
        <BrandMark className="size-[22px] flex-none" />
        <span className="hidden min-[361px]:inline">Brightline Cooling</span>
        <span className="wp-tertiary ml-auto inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">
          <Info className="size-3.5" aria-hidden="true" />
          Sample record
        </span>
      </div>
      <div
        role="tablist"
        aria-label="Follow one record"
        className="flex gap-1 border-b border-border p-1.5 sm:p-2.5"
        onKeyDown={onKeyDown}
      >
        {steps.map((step, stepIndex) => {
          const selected = step.key === active;
          return (
            <button
              key={step.key}
              ref={(node) => {
                tabs.current[stepIndex] = node;
              }}
              type="button"
              role="tab"
              id={`record-tab-${step.key}`}
              aria-controls="record-panel"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(step.key)}
              className={cn(
                "inline-flex min-h-11 min-w-0 flex-1 basis-0 items-center justify-center rounded-[10px] px-1.5 text-center text-[13px] font-semibold leading-tight transition-colors sm:whitespace-nowrap sm:px-3 sm:text-[14.5px]",
                selected
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {step.tab}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id="record-panel"
        aria-labelledby={`record-tab-${active}`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: tab panels are focusable per the WAI-ARIA tabs pattern
        tabIndex={0}
        className="px-3.5 pb-4 pt-4 sm:min-h-[300px] sm:px-5 sm:pb-5 sm:pt-[18px]"
      >
        <div className="wp-record-in grid gap-4" key={active}>
          <ActiveRecord />
        </div>
      </div>
      <div className="grid gap-0.5 border-t border-border px-3.5 pb-3.5 pt-3 sm:px-5 sm:pb-4">
        <p className="text-[14.5px] font-semibold" aria-live="polite">
          {current.caption}
        </p>
        <p className="wp-tertiary text-[13px]">
          Illustrative record. Your team takes each action.
        </p>
      </div>
    </div>
  );
}
