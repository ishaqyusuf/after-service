"use client";

import { useSyncExternalStore } from "react";
import { useTimeZone } from "@/hooks/use-time-zone";

type TodayParts = {
  iso: string;
  day: string;
  weekday: string;
  month: string;
};

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

function readToday(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
    timeZone,
  }).formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const isoDate = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone,
  }).format(new Date());

  return [
    isoDate,
    get("day"),
    get("weekday"),
    `${get("month")} ${get("year")}`,
  ].join("|");
}

function toParts(snapshot: string | null): TodayParts | null {
  if (!snapshot) return null;
  const [iso = "", day = "", weekday = "", month = ""] = snapshot.split("|");
  return { iso, day, weekday, month };
}

/** Today's date in the operator's time zone, rendered after hydration. */
export function HeaderDate() {
  const timeZone = useTimeZone();
  const today = toParts(
    useSyncExternalStore(
      subscribe,
      () => readToday(timeZone),
      () => null,
    ),
  );

  if (!today) {
    return <span className="block h-[30px] w-9 shrink-0" aria-hidden />;
  }

  return (
    <time dateTime={today.iso} className="flex shrink-0 items-center gap-2.5">
      <span className="sr-only">
        Today, {today.weekday} {today.day} {today.month}
      </span>
      <span
        aria-hidden
        className="wp-display wp-numerals text-2xl leading-none text-[color:var(--wp-teal-ink)] sm:text-[30px]"
      >
        {today.day}
      </span>
      <span
        aria-hidden
        className="hidden text-[12.5px] leading-tight text-[color:var(--wp-ink-2)] sm:grid"
      >
        <span className="font-semibold text-foreground">{today.weekday}</span>
        <span>{today.month}</span>
      </span>
    </time>
  );
}
