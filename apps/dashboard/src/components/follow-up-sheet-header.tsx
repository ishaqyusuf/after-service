"use client";

import { cn } from "@afterservice/ui/cn";
import type { FollowUp } from "@/components/follow-up/form-context";
import { ChannelTag } from "@/components/follow-up-channel";
import {
  overdueTextClassName,
  StageSticker,
  toFollowUpStage,
} from "@/components/follow-up-stage";
import {
  calendarDay,
  dayNumber,
  followUpDueLine,
  isOverdue,
  monthShort,
} from "@/utils/follow-up-dates";

type Props = {
  followUp?: FollowUp;
  timeZone: string;
};

export function FollowUpSheetHeader({ followUp, timeZone }: Props) {
  if (!followUp) {
    return (
      <h2 className="font-[family-name:var(--font-display)] text-2xl leading-[1.15]">
        Work follow-up
      </h2>
    );
  }

  const today = calendarDay(new Date(), timeZone);
  const dueDay = calendarDay(followUp.dueAt, timeZone);
  const stage = toFollowUpStage(followUp.status, dueDay, today);
  const overdue = isOverdue(followUp, today, timeZone);

  return (
    <div className="flex min-w-0 items-start gap-4">
      <span
        aria-hidden="true"
        className="grid w-[64px] shrink-0 justify-items-center overflow-hidden rounded-xl border border-border bg-card pb-2 leading-none sm:w-[72px]"
      >
        <span className="mb-2 w-full bg-[var(--wp-teal,#007d7a)] py-1 text-center text-xs font-semibold text-[var(--wp-on-teal,#ffffff)] dark:bg-[var(--wp-teal,#33b5af)] dark:text-[var(--wp-on-teal,#031b1a)]">
          {monthShort(dueDay)}
        </span>
        <span
          className={cn(
            "font-[family-name:var(--font-display)] text-[28px] leading-none tabular-nums sm:text-[32px]",
            overdue && overdueTextClassName,
          )}
        >
          {dayNumber(dueDay)}
        </span>
      </span>
      <div className="grid min-w-0 gap-1">
        <h2 className="break-words font-[family-name:var(--font-display)] text-2xl leading-[1.15]">
          {followUp.customerName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {followUp.serviceTitle ?? "General check-in"}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          <StageSticker stage={stage} />
          <span className={overdue ? overdueTextClassName : "font-semibold"}>
            {followUpDueLine(followUp, today, timeZone)}
          </span>
          <ChannelTag channel={followUp.channel} />
        </p>
      </div>
    </div>
  );
}
