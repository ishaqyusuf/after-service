"use client";

import { Skeleton } from "@afterservice/ui";
import {
  type FollowUpStage,
  followUpStageLabels,
  StageSticker,
} from "@/components/follow-up-stage";
import {
  eventNotes,
  followUpDueLine,
  latestEvent,
} from "@/utils/follow-up-dates";
import type { FollowUpBoardItem } from "./overview-types";
import { PlannerPanel, QuietEmpty } from "./planner-panel";

const visibleRows = 5;

function replySummary(item: FollowUpBoardItem) {
  return eventNotes(latestEvent(item.events, "replied"));
}
const rowSkeletons = ["r1", "r2", "r3"];

type FollowUpMiniListProps = {
  emptyText: string;
  isError: boolean;
  isLoading: boolean;
  items: FollowUpBoardItem[];
  onOpen: (id: string) => void;
  stage: FollowUpStage;
  timeZone: string;
  title: string;
  today: string;
};

export function FollowUpMiniList({
  emptyText,
  isError,
  isLoading,
  items,
  onOpen,
  stage,
  timeZone,
  title,
  today,
}: FollowUpMiniListProps) {
  const visible = items.slice(0, visibleRows);
  const hidden = items.length - visible.length;

  return (
    <PlannerPanel
      title={title}
      count={isLoading || isError ? undefined : items.length}
    >
      {isLoading ? (
        <div aria-hidden="true" className="grid gap-3 py-1">
          {rowSkeletons.map((key) => (
            <Skeleton key={key} className="h-9 w-full" />
          ))}
        </div>
      ) : isError ? (
        <QuietEmpty>This list could not load. Refresh to try again.</QuietEmpty>
      ) : items.length === 0 ? (
        <QuietEmpty>{emptyText}</QuietEmpty>
      ) : (
        <ul className="grid">
          {visible.map((item) => (
            <li
              key={item.id}
              className="border-t border-border first:border-t-0"
            >
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="group flex min-h-11 w-full items-center gap-2.5 rounded-md px-0.5 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <StageSticker stage={stage} showLabel={false} />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate font-semibold group-hover:text-[var(--wp-teal-ink,#006966)] dark:group-hover:text-[var(--wp-teal-ink,#6dd3cd)]">
                    {item.customerName}
                  </span>
                  <span className="truncate text-[13px] text-muted-foreground">
                    {stage === "replied" && replySummary(item)
                      ? `“${replySummary(item)}”`
                      : (item.serviceTitle ?? "General check-in")}
                  </span>
                </span>
                <span className="whitespace-nowrap text-[12.5px] text-muted-foreground">
                  {followUpDueLine(item, today, timeZone)}
                </span>
              </button>
            </li>
          ))}
          {hidden > 0 ? (
            <li className="border-t border-border pt-2.5 text-[13px] text-muted-foreground">
              {hidden} more in {followUpStageLabels[stage]} on the board.
            </li>
          ) : null}
        </ul>
      )}
    </PlannerPanel>
  );
}
