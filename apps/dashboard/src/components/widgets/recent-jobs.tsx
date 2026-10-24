"use client";

import { Button } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import {
  serviceJobStatusLabels,
  toServiceJobStatus,
} from "@/hooks/use-job-filter-params";
import { calendarDay, formatDayShort } from "@/utils/follow-up-dates";
import type { DashboardOverviewData } from "./overview-types";
import {
  PlannerPanel,
  plannerLinkClassName,
  QuietEmpty,
} from "./planner-panel";

type RecentJob = DashboardOverviewData["recentJobs"][number];

const statusClassNames: Record<string, string> = {
  needs_follow_up:
    "border-transparent bg-[var(--wp-upcoming-soft,#fff3d1)] text-[var(--wp-upcoming-ink,#7f5600)] dark:bg-[var(--wp-upcoming-soft,#33280e)] dark:text-[var(--wp-upcoming-ink,#f0c869)]",
  resolved:
    "border-transparent bg-[var(--wp-replied-soft,#e2f4e9)] text-[#136238] dark:bg-[var(--wp-replied-soft,#10301f)] dark:text-[var(--wp-replied,#4cc681)]",
};

export function RecentJobs({
  className,
  data,
  timeZone,
}: {
  className?: string;
  data: DashboardOverviewData;
  timeZone: string;
}) {
  const [, setScheduleJobId] = useQueryState("schedule_follow_up");

  return (
    <PlannerPanel
      title="Recent jobs"
      className={className}
      action={
        <Link href="/jobs" className={plannerLinkClassName}>
          All jobs
        </Link>
      }
    >
      {data.recentJobs.length > 0 ? (
        <ul className="grid">
          {data.recentJobs.map((job) => (
            <RecentJobRow
              key={job.id}
              job={job}
              onSchedule={() => setScheduleJobId(job.id)}
              timeZone={timeZone}
            />
          ))}
        </ul>
      ) : (
        <QuietEmpty>
          No jobs logged yet. Log completed work to plan its first check-in.
        </QuietEmpty>
      )}
    </PlannerPanel>
  );
}

function RecentJobRow({
  job,
  onSchedule,
  timeZone,
}: {
  job: RecentJob;
  onSchedule: () => void;
  timeZone: string;
}) {
  const status = toServiceJobStatus(job.status);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border py-2.5 first:border-t-0 first:pt-0.5 sm:flex-nowrap">
      <div className="grid min-w-0 flex-1">
        <span className="truncate font-semibold">{job.title}</span>
        <span className="truncate text-[12.5px] text-muted-foreground">
          {job.customerName} · completed{" "}
          {formatDayShort(calendarDay(job.completedAt, timeZone))}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex h-[22px] items-center whitespace-nowrap rounded-full border border-border bg-background px-2 text-xs font-semibold text-muted-foreground",
          statusClassNames[job.status],
        )}
      >
        {status ? serviceJobStatusLabels[status] : job.status}
      </span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-10 gap-1.5 px-2.5 sm:h-8"
        onClick={onSchedule}
      >
        <CalendarClock aria-hidden="true" className="size-4" />
        Plan check-in
        <span className="sr-only"> for {job.title}</span>
      </Button>
    </li>
  );
}
