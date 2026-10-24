"use client";

import { Button } from "@afterservice/ui";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useTimeZone } from "@/hooks/use-time-zone";
import { useTRPC } from "@/trpc/client";
import { calendarDay } from "@/utils/follow-up-dates";
import { DueToday } from "./due-today";
import { FollowUpMiniList } from "./follow-up-mini-list";
import { OverviewHeader } from "./overview-header";
import type { DashboardOverviewData } from "./overview-types";
import { RecentJobs } from "./recent-jobs";
import { WeekFacts } from "./week-facts";
import { WeekStrip } from "./week-strip";

const emptyCounts: DashboardOverviewData["counts"] = {
  completedThisWeek: 0,
  customers: 0,
  dueToday: 0,
  jobs: 0,
  openFollowUps: 0,
  overdueFollowUps: 0,
  resolvedFollowUps: 0,
  sentThisWeek: 0,
  upcomingFollowUps: 0,
};

function normalizeOverviewData(data: DashboardOverviewData) {
  return {
    ...data,
    counts: {
      ...emptyCounts,
      ...data.counts,
    },
    followUpChannels: data.followUpChannels ?? [],
    followUpStatuses: data.followUpStatuses ?? [],
    recentFollowUps: data.recentFollowUps ?? [],
    recentJobs: data.recentJobs ?? [],
  };
}

export function OverviewView() {
  const trpc = useTRPC();
  const timeZone = useTimeZone();
  const { data, refetch } = useSuspenseQuery(
    trpc.dashboard.overview.queryOptions({ timeZone }),
  );
  // The board query returns every follow-up in the workspace, so day and
  // stage totals below are complete rather than sampled from a recent list.
  const board = useSuspenseQuery(
    trpc.followUps.listBoard.queryOptions({ timeZone }),
  );
  const { setParams } = useFollowUpParams();

  if (!data)
    return (
      <OverviewEmptyState
        onRetry={() => {
          void refetch();
        }}
      />
    );

  const overviewData = normalizeOverviewData(data);
  const today = calendarDay(new Date(), timeZone);
  const columns = board.data?.columns;
  const openItems = columns
    ? [
        ...columns.dueToday,
        ...columns.upcoming,
        ...columns.waiting,
        ...columns.replied,
      ]
    : [];
  const boardState = {
    isError: board.isError,
    isLoading: board.isLoading,
    onOpen: (id: string) => setParams({ followUpId: id }),
    onRetry: () => {
      void board.refetch();
    },
    timeZone,
    today,
  };

  return (
    <div className="grid gap-5 md:gap-6">
      <OverviewHeader
        data={overviewData}
        stageCounts={
          columns
            ? {
                replied: columns.replied.length,
                waiting: columns.waiting.length,
              }
            : undefined
        }
      />
      <div className="grid items-start gap-4 min-[1100px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 min-[1100px]:col-span-2">
          <WeekStrip {...boardState} items={openItems} />
        </div>
        <DueToday {...boardState} items={columns?.dueToday ?? []} />
        <div className="grid min-w-0 gap-4">
          <FollowUpMiniList
            {...boardState}
            emptyText="No replies waiting on you."
            items={columns?.replied ?? []}
            stage="replied"
            title="Replied · decide the next step"
          />
          <FollowUpMiniList
            {...boardState}
            emptyText="No one is waiting on a reply."
            items={columns?.waiting ?? []}
            stage="waiting"
            title="Waiting for a reply"
          />
        </div>
        <RecentJobs data={overviewData} timeZone={timeZone} />
        <WeekFacts data={overviewData} />
      </div>
    </div>
  );
}

function OverviewEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid gap-5 md:gap-6">
      <header className="grid gap-1.5">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] leading-[1.1] tracking-[-0.01em] md:text-[30px]">
          Overview
        </h1>
        <p className="max-w-[70ch] text-[14.5px] text-muted-foreground">
          Workspace activity is not available yet.
        </p>
      </header>

      <section className="flex flex-wrap items-start gap-x-[18px] gap-y-3.5 rounded-[14px] border-[1.5px] border-dashed border-border px-6 py-[26px]">
        <div className="min-w-0 flex-[1_1_280px]">
          <h2 className="mb-1 text-base font-bold">No overview data found</h2>
          <p className="max-w-[60ch] text-sm text-muted-foreground">
            Refresh the dashboard to load counts, recent jobs, and follow-up
            health for this workspace.
          </p>
        </div>
        <Button variant="outline" onClick={onRetry} className="self-center">
          Refresh dashboard
        </Button>
      </section>
    </div>
  );
}
