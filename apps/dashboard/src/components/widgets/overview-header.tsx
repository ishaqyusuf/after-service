"use client";

import { Button } from "@afterservice/ui";
import { CalendarClock, Plus } from "lucide-react";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useJobParams } from "@/hooks/use-job-params";
import type { DashboardOverviewData } from "./overview-types";

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

type OverviewHeaderProps = {
  data: DashboardOverviewData;
  // Board counts, when loaded. Absent while followUps.listBoard is loading.
  stageCounts?: { replied: number; waiting: number };
};

export function OverviewHeader({ data, stageCounts }: OverviewHeaderProps) {
  const { setParams: setFollowUpParams } = useFollowUpParams();
  const { setParams: setJobParams } = useJobParams();
  const { dueToday, overdueFollowUps } = data.counts;

  const dueSentence = `${plural(dueToday, "follow-up")} due today${
    overdueFollowUps ? `, ${overdueFollowUps} overdue` : ""
  }.`;
  const stageSentence = stageCounts
    ? ` ${stageCounts.waiting} waiting for a reply, ${plural(stageCounts.replied, "reply", "replies")} to act on.`
    : "";

  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="grid min-w-0 gap-1.5">
        <h1 className="font-[family-name:var(--font-display)] text-[26px] leading-[1.1] tracking-[-0.01em] md:text-[30px]">
          Overview
        </h1>
        <p className="max-w-[70ch] text-[14.5px] text-muted-foreground">
          {dueSentence}
          {stageSentence}
        </p>
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <Button
          type="button"
          variant="outline"
          className="h-11 min-w-[160px] flex-1 gap-2 whitespace-nowrap sm:h-[38px] sm:min-w-0 sm:flex-none"
          onClick={() => setFollowUpParams({ createFollowUp: true })}
        >
          <CalendarClock aria-hidden="true" className="size-4" />
          Plan follow-up
        </Button>
        <Button
          type="button"
          className="h-11 min-w-[160px] flex-1 gap-2 whitespace-nowrap sm:h-[38px] sm:min-w-0 sm:flex-none"
          onClick={() => setJobParams({ createJob: true })}
        >
          <Plus aria-hidden="true" className="size-4" />
          Log job
        </Button>
      </div>
    </header>
  );
}
