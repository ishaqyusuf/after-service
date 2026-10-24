"use client";

import { Button, Skeleton } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  ChannelIcon,
  followUpChannelLabel,
} from "@/components/follow-up-channel";
import {
  type FollowUpStage,
  StageDot,
  StageSticker,
  toFollowUpStage,
} from "@/components/follow-up-stage";
import {
  calendarDay,
  dayNumber,
  formatDayLong,
  formatDayShort,
  shiftCalendarDay,
  weekdayShort,
} from "@/utils/follow-up-dates";
import type { FollowUpBoardItem } from "./overview-types";
import { plannerLinkClassName } from "./planner-panel";

const legendStages: FollowUpStage[] = ["due", "upcoming", "waiting", "replied"];
const visibleChipsPerDay = 4;
const daySkeletons = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"];

type WeekStripProps = {
  isError: boolean;
  isLoading: boolean;
  // Every open follow-up in the workspace (followUps.listBoard, closed excluded).
  items: FollowUpBoardItem[];
  onOpen: (id: string) => void;
  onRetry: () => void;
  timeZone: string;
  today: string;
};

export function WeekStrip({
  isError,
  isLoading,
  items,
  onOpen,
  onRetry,
  timeZone,
  today,
}: WeekStripProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const start = shiftCalendarDay(today, weekOffset * 7 - 2);
  const days = Array.from({ length: 7 }, (_, index) =>
    shiftCalendarDay(start, index),
  );
  const end = days[6] ?? start;

  const byDay = new Map<string, FollowUpBoardItem[]>();
  let earlierOverdue = 0;
  for (const item of items) {
    const day = calendarDay(item.dueAt, timeZone);
    if (day < start) {
      if (toFollowUpStage(item.status, day, today) === "due") earlierOverdue++;
      continue;
    }
    if (day > end) continue;
    byDay.set(day, [...(byDay.get(day) ?? []), item]);
  }

  return (
    <section
      aria-labelledby="week-strip-title"
      className="overflow-hidden rounded-[14px] border border-border bg-card text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-border px-4 py-3 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <h2
            id="week-strip-title"
            className="text-[15px] font-semibold tracking-[-0.005em]"
          >
            {formatDayShort(start)} – {formatDayShort(end)}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-11 md:size-8"
              aria-label="Show previous week"
              onClick={() => setWeekOffset((offset) => offset - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-11 md:size-8"
              aria-label="Show next week"
              onClick={() => setWeekOffset((offset) => offset + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
            {weekOffset !== 0 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-11 px-2 md:h-8"
                onClick={() => setWeekOffset(0)}
              >
                This week
              </Button>
            ) : null}
          </div>
        </div>
        <ul
          aria-label="Sticker key"
          className="flex flex-wrap gap-x-4 gap-y-1.5"
        >
          {legendStages.map((stage) => (
            <li key={stage}>
              <StageSticker
                stage={stage}
                className="text-[12.5px] font-medium text-muted-foreground"
              />
            </li>
          ))}
        </ul>
      </div>

      {isLoading ? (
        <ol aria-hidden="true" className="grid grid-cols-1 md:grid-cols-7">
          {daySkeletons.map((key) => (
            <li
              key={key}
              className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0 md:min-h-[148px] md:flex-col md:border-b-0 md:border-r md:px-2.5 md:last:border-r-0"
            >
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-7 flex-1 md:w-full md:flex-none" />
            </li>
          ))}
        </ol>
      ) : isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-5">
          <p className="text-sm text-muted-foreground">
            The week could not load. Your follow-ups are safe; try again.
          </p>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : (
        <ol className="grid grid-cols-1 md:grid-cols-7">
          {days.map((day) => {
            const dayItems = byDay.get(day) ?? [];
            const visible = dayItems.slice(0, visibleChipsPerDay);
            const hidden = dayItems.length - visible.length;
            const isToday = day === today;
            const isPast = day < today;

            return (
              <li
                key={day}
                aria-label={`${formatDayLong(day)}${isToday ? ", today" : ""}, ${dayItems.length} follow-up${dayItems.length === 1 ? "" : "s"}`}
                className={cn(
                  "flex items-start gap-3 border-b border-border px-4 py-2.5 last:border-b-0 md:min-h-[148px] md:flex-col md:gap-2 md:border-b-0 md:border-r md:px-2.5 md:pb-3 md:pt-2.5 md:last:border-r-0",
                  isToday &&
                    "bg-[var(--wp-teal-soft,#e1f1ef)] dark:bg-[var(--wp-teal-soft,#11302d)]",
                )}
              >
                <div className="flex w-11 shrink-0 flex-col-reverse items-center justify-end gap-0.5 md:w-full md:flex-row md:items-baseline md:justify-between md:gap-1.5">
                  <span
                    className={cn(
                      "text-[12.5px] font-semibold text-muted-foreground",
                      isToday &&
                        "text-[var(--wp-teal-ink,#006966)] dark:text-[var(--wp-teal-ink,#6dd3cd)]",
                    )}
                  >
                    {isToday ? "Today" : weekdayShort(day)}
                  </span>
                  <span
                    className={cn(
                      "font-[family-name:var(--font-display)] text-[26px] leading-none tabular-nums",
                      isPast && "text-muted-foreground",
                      isToday &&
                        "text-[var(--wp-teal-ink,#006966)] dark:text-[var(--wp-teal-ink,#6dd3cd)]",
                    )}
                  >
                    {dayNumber(day)}
                  </span>
                </div>
                {dayItems.length > 0 ? (
                  <ul className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-[5px] md:w-full md:grid-cols-1">
                    {visible.map((item) => (
                      <WeekChip
                        key={item.id}
                        item={item}
                        onOpen={onOpen}
                        stage={toFollowUpStage(item.status, day, today)}
                      />
                    ))}
                    {hidden > 0 ? (
                      <li>
                        <Link
                          href="/follow-ups"
                          className="flex min-h-[30px] items-center px-2 text-[12.5px] font-semibold text-muted-foreground underline-offset-[3px] hover:text-foreground hover:underline"
                        >
                          +{hidden} more
                          <span className="sr-only">
                            {" "}
                            on {formatDayLong(day)}
                          </span>
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="self-center text-[12.5px] text-muted-foreground md:hidden">
                    Nothing planned
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {!isLoading && !isError && earlierOverdue > 0 ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-4 py-2.5 text-[13px] text-muted-foreground sm:px-5">
          <span className="inline-flex items-center gap-2">
            <StageDot stage="due" />
            {earlierOverdue} overdue from before {formatDayShort(start)}
          </span>
          <Link href="/follow-ups" className={plannerLinkClassName}>
            Open board
          </Link>
        </p>
      ) : null}
    </section>
  );
}

function WeekChip({
  item,
  onOpen,
  stage,
}: {
  item: FollowUpBoardItem;
  onOpen: (id: string) => void;
  stage: FollowUpStage;
}) {
  const firstName = item.customerName.split(/\s+/)[0] ?? item.customerName;

  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className={cn(
          "flex min-h-[30px] w-full items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-[3px] text-left text-[12.5px] font-semibold transition-colors hover:border-[var(--wp-teal,#007d7a)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-md:min-h-11",
          stage === "due" &&
            "border-[color-mix(in_srgb,var(--wp-due,#e0482f)_40%,hsl(var(--border)))]",
        )}
      >
        <StageSticker stage={stage} showLabel={false} />
        <span className="min-w-0 flex-1 truncate">{firstName}</span>
        <ChannelIcon
          channel={item.channel}
          className="size-3.5 text-muted-foreground"
        />
        <span className="sr-only">
          {`, ${item.customerName}, ${item.serviceTitle ?? "General check-in"}, ${followUpChannelLabel(item.channel)}`}
        </span>
      </button>
    </li>
  );
}
