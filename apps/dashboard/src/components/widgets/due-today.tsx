"use client";

import { Button, Skeleton } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import { Send } from "lucide-react";
import Link from "next/link";
import { ChannelTag } from "@/components/follow-up-channel";
import { overdueTextClassName } from "@/components/follow-up-stage";
import { followUpDueLine, initials, isOverdue } from "@/utils/follow-up-dates";
import type { FollowUpBoardItem } from "./overview-types";
import {
  InitialsAvatar,
  PlannerPanel,
  plannerLinkClassName,
  QuietEmpty,
} from "./planner-panel";

const visibleRows = 8;
const rowSkeletons = ["r1", "r2", "r3", "r4"];

type DueTodayProps = {
  isError: boolean;
  isLoading: boolean;
  items: FollowUpBoardItem[];
  onOpen: (id: string) => void;
  onRetry: () => void;
  timeZone: string;
  today: string;
};

export function DueToday({
  isError,
  isLoading,
  items,
  onOpen,
  onRetry,
  timeZone,
  today,
}: DueTodayProps) {
  const visible = items.slice(0, visibleRows);
  const hidden = items.length - visible.length;

  return (
    <PlannerPanel
      title="Due today"
      count={isLoading || isError ? undefined : items.length}
      action={
        <Link href="/follow-ups" className={plannerLinkClassName}>
          Open board
        </Link>
      }
    >
      {isLoading ? (
        <div aria-hidden="true" className="grid gap-4 py-1">
          {rowSkeletons.map((key) => (
            <div key={key} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="grid flex-1 gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <QuietEmpty>Due follow-ups could not load.</QuietEmpty>
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <QuietEmpty>
          Nobody is due today. Upcoming check-ins appear here on their date.
        </QuietEmpty>
      ) : (
        <>
          <ul className="grid">
            {visible.map((item) => (
              <DueRow
                key={item.id}
                item={item}
                onOpen={onOpen}
                overdue={isOverdue(item, today, timeZone)}
                dueLine={followUpDueLine(item, today, timeZone)}
              />
            ))}
          </ul>
          {hidden > 0 ? (
            <p className="mt-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
              {hidden} more due.{" "}
              <Link href="/follow-ups" className={plannerLinkClassName}>
                See all on the board
              </Link>
            </p>
          ) : null}
        </>
      )}
    </PlannerPanel>
  );
}

function DueRow({
  dueLine,
  item,
  onOpen,
  overdue,
}: {
  dueLine: string;
  item: FollowUpBoardItem;
  onOpen: (id: string) => void;
  overdue: boolean;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 border-t border-border py-2.5 first:border-t-0 first:pt-0.5 md:flex-nowrap">
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className="group -m-1 grid min-w-0 flex-1 grid-cols-[32px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-[10px] p-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:flex"
      >
        <InitialsAvatar
          name={item.customerName}
          initials={initials(item.customerName)}
          className={cn(
            overdue &&
              "bg-[var(--wp-due-soft,#fdebe7)] text-[var(--wp-due-ink,#b23119)] dark:bg-[var(--wp-due-soft,#3a1a14)] dark:text-[var(--wp-due-ink,#ff8c78)]",
          )}
        />
        <span className="grid min-w-0 flex-1 gap-px">
          <span className="truncate text-[14.5px] font-semibold group-hover:text-[var(--wp-teal-ink,#006966)] dark:group-hover:text-[var(--wp-teal-ink,#6dd3cd)]">
            {item.customerName}
          </span>
          <span className="truncate text-[13.5px] text-muted-foreground">
            {item.serviceTitle ?? "General check-in"}
          </span>
        </span>
        <span className="col-start-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[13px] md:grid md:shrink-0 md:justify-items-end md:gap-[3px] md:text-right">
          <span className={overdue ? overdueTextClassName : "font-semibold"}>
            {dueLine}
          </span>
          <ChannelTag channel={item.channel} />
        </span>
      </button>
      <div className="flex w-full shrink-0 items-center gap-1 pl-11 md:w-auto md:pl-0">
        <Button
          type="button"
          size="sm"
          className="h-11 flex-1 gap-2 md:h-8 md:flex-none"
          onClick={() => onOpen(item.id)}
        >
          <Send aria-hidden="true" className="size-4" />
          Work follow-up
          <span className="sr-only"> for {item.customerName}</span>
        </Button>
      </div>
    </li>
  );
}
