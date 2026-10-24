"use client";

import { Button, Skeleton } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { useState } from "react";
import {
  ChannelIcon,
  followUpChannelLabel,
} from "@/components/follow-up-channel";
import {
  type FollowUpStage,
  followUpStageColumns,
  followUpStageHints,
  followUpStageLabels,
  followUpStages,
  overdueTextClassName,
  StageSticker,
} from "@/components/follow-up-stage";
import type {
  FollowUpBoardColumns,
  FollowUpBoardItem,
} from "@/components/widgets/overview-types";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useTimeZone } from "@/hooks/use-time-zone";
import { useTRPC } from "@/trpc/client";
import {
  calendarDay,
  dayNumber,
  eventNotes,
  followUpDueLine,
  isOverdue,
  latestEvent,
  monthShort,
} from "@/utils/follow-up-dates";

const boardCardSkeletons = ["first", "second", "third"];

export function FollowUpsBoard() {
  const trpc = useTRPC();
  const timeZone = useTimeZone();
  const { data } = useSuspenseQuery(
    trpc.followUps.listBoard.queryOptions({ timeZone }),
  );
  const { columns } = data;
  // View-only stage selection for phones; desktop shows every lane.
  const [activeStage, setActiveStage] = useState<FollowUpStage>("due");

  if (!columns) return null;

  const totalItems = followUpStages.reduce(
    (total, stage) => total + columns[followUpStageColumns[stage]].length,
    0,
  );

  if (totalItems === 0) {
    return <FollowUpsBoardEmptyState />;
  }

  const today = calendarDay(new Date(), timeZone);

  return (
    <div className="min-w-0">
      <StageTabs
        activeStage={activeStage}
        columns={columns}
        onSelect={setActiveStage}
      />
      <div className="overscroll-x-contain pb-1 md:overflow-x-auto">
        <div className="block md:grid md:min-w-[1150px] md:grid-cols-[repeat(5,minmax(224px,1fr))] md:gap-3">
          {followUpStages.map((stage) => (
            <BoardColumn
              key={stage}
              isActive={stage === activeStage}
              items={columns[followUpStageColumns[stage]]}
              stage={stage}
              timeZone={timeZone}
              today={today}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StageTabs({
  activeStage,
  columns,
  onSelect,
}: {
  activeStage: FollowUpStage;
  columns: FollowUpBoardColumns;
  onSelect: (stage: FollowUpStage) => void;
}) {
  return (
    <fieldset className="-mx-0.5 flex min-w-0 snap-x snap-proximity gap-1.5 overflow-x-auto overscroll-x-contain px-0.5 pb-2.5 pt-0.5 md:hidden">
      <legend className="sr-only">Show follow-up stage</legend>
      {followUpStages.map((stage) => {
        const isActive = stage === activeStage;
        return (
          <button
            key={stage}
            type="button"
            aria-pressed={isActive}
            aria-controls={`board-column-${stage}`}
            onClick={() => onSelect(stage)}
            className={cn(
              "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive && "border-foreground bg-foreground text-background",
            )}
          >
            {followUpStageLabels[stage]}
            <span className="tabular-nums opacity-80">
              {columns[followUpStageColumns[stage]].length}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

export function FollowUpsBoardSkeleton() {
  return (
    <div aria-busy="true" className="min-w-0">
      <output className="sr-only">Loading follow-up board</output>
      <div aria-hidden="true" className="flex gap-1.5 pb-2.5 md:hidden">
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
      <div aria-hidden="true" className="md:overflow-x-auto">
        <div className="block md:grid md:min-w-[1150px] md:grid-cols-[repeat(5,minmax(224px,1fr))] md:gap-3">
          {followUpStages.map((stage, index) => (
            <div
              key={stage}
              className={cn(
                "rounded-[14px] border border-border bg-[var(--wp-rail,hsl(var(--muted)))] p-2.5",
                index > 0 && "hidden md:block",
              )}
            >
              <div className="px-1 pb-2.5 pt-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-40" />
              </div>
              <div className="grid gap-2">
                {boardCardSkeletons.map((card) => (
                  <div
                    key={`${stage}-${card}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)] gap-2.5 rounded-xl border border-border bg-card p-2.5"
                  >
                    <Skeleton className="h-9 w-8 justify-self-center" />
                    <div className="grid gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FollowUpsBoardEmptyState() {
  const { setParams } = useFollowUpParams();

  return (
    <section className="flex flex-wrap items-start gap-x-[18px] gap-y-3.5 rounded-[14px] border-[1.5px] border-dashed border-border px-6 py-[26px]">
      <ClipboardList
        aria-hidden="true"
        className="size-6 text-muted-foreground"
      />
      <div className="min-w-0 flex-[1_1_280px]">
        <h2 className="mb-1 text-base font-bold">No follow-ups</h2>
        <p className="max-w-[60ch] text-sm text-muted-foreground">
          Create a follow-up to keep the next customer check-in visible.
        </p>
      </div>
      <Button
        variant="outline"
        className="h-11 self-center md:h-9"
        onClick={() => setParams({ createFollowUp: true })}
      >
        Create follow-up
      </Button>
    </section>
  );
}

function BoardColumn({
  isActive,
  items,
  stage,
  timeZone,
  today,
}: {
  isActive: boolean;
  items: FollowUpBoardItem[];
  stage: FollowUpStage;
  timeZone: string;
  today: string;
}) {
  const titleId = `board-column-title-${stage}`;

  return (
    <section
      id={`board-column-${stage}`}
      aria-labelledby={titleId}
      className={cn(
        "min-w-0 rounded-[14px] border border-border bg-[var(--wp-rail,hsl(var(--muted)))] p-2.5 md:block",
        isActive ? "block" : "hidden",
      )}
    >
      <header className="px-1 pb-2.5 pt-1">
        <h2 id={titleId} className="flex items-center text-sm">
          <StageSticker stage={stage} className="text-sm font-semibold" />
          <span className="ml-2 inline-grid h-5 min-w-[22px] place-items-center rounded-full border border-border bg-background px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
            {items.length}
          </span>
        </h2>
        <p className="mt-[3px] text-xs leading-[1.4] text-muted-foreground">
          {followUpStageHints[stage]}
        </p>
      </header>
      {items.length > 0 ? (
        <ul className="grid gap-2">
          {items.map((item) => (
            <FollowUpCard
              item={item}
              key={item.id}
              stage={stage}
              timeZone={timeZone}
              today={today}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-2 py-[22px] text-center text-[13px] text-muted-foreground">
          No follow-ups in this stage.
        </p>
      )}
    </section>
  );
}

function FollowUpCard({
  item,
  stage,
  timeZone,
  today,
}: {
  item: FollowUpBoardItem;
  stage: FollowUpStage;
  timeZone: string;
  today: string;
}) {
  const { setParams } = useFollowUpParams();
  const dueDay = calendarDay(item.dueAt, timeZone);
  const overdue = isOverdue(item, today, timeZone);
  const isClosed = stage === "closed";
  const reply =
    stage === "replied"
      ? eventNotes(latestEvent(item.events, "replied"))
      : null;

  return (
    <li>
      <button
        type="button"
        onClick={() => setParams({ followUpId: item.id })}
        className={cn(
          "grid w-full grid-cols-[44px_minmax(0,1fr)] gap-2.5 rounded-xl border border-border bg-card p-2.5 text-left transition-[border-color,box-shadow] duration-150 hover:border-[var(--wp-line-2,hsl(var(--muted-foreground)))] hover:shadow-[0_1px_2px_rgb(15_31_28/0.06),0_4px_14px_rgb(15_31_28/0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          isClosed && "border-dashed bg-transparent",
        )}
      >
        <span
          aria-hidden="true"
          className="grid content-start justify-items-center pt-0.5 leading-none"
        >
          <span
            className={cn(
              "font-[family-name:var(--font-display)] text-[22px] leading-none tabular-nums",
              overdue && overdueTextClassName,
              isClosed && "text-muted-foreground",
            )}
          >
            {dayNumber(dueDay)}
          </span>
          <span className="mt-[3px] text-[11.5px] text-muted-foreground">
            {monthShort(dueDay)}
          </span>
        </span>
        <span className="grid min-w-0 gap-0.5">
          <span
            className={cn(
              "truncate font-semibold",
              isClosed && "text-muted-foreground",
            )}
          >
            {item.customerName}
          </span>
          <span className="line-clamp-2 text-[13px] text-muted-foreground">
            {reply
              ? `“${reply}”`
              : item.notes?.trim() || item.serviceTitle || "General check-in"}
          </span>
          {!reply && item.notes?.trim() && item.serviceTitle ? (
            <span className="truncate text-xs text-muted-foreground">
              {item.serviceTitle}
            </span>
          ) : null}
          <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <ChannelIcon channel={item.channel} className="size-3.5" />
            <span className="sr-only">
              {followUpChannelLabel(item.channel)},{" "}
            </span>
            <span className={cn("truncate", overdue && overdueTextClassName)}>
              {followUpDueLine(item, today, timeZone)}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
