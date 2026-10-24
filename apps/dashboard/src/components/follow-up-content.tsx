"use client";

import { CalendarClock, Check, Reply, Send, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import { AskAssistantButton } from "@/components/assistant/assistant-launcher";
import {
  type FollowUp,
  useFollowUpFormContext,
} from "@/components/follow-up/form-context";
import { followUpChannelLabel } from "@/components/follow-up-channel";
import { FollowUpSheetHeader } from "@/components/follow-up-sheet-header";
import { FollowUpWorkForm } from "@/components/forms/follow-up-work-form";
import { DashboardSheetContent } from "@/components/sheets/dashboard-sheet-content";
import { SheetFormSkeleton } from "@/components/sheets/sheet-form-skeleton";
import { SheetMissingState } from "@/components/sheets/sheet-missing-state";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useTimeZone } from "@/hooks/use-time-zone";
import { eventNotes, formatStamp } from "@/utils/follow-up-dates";

type Props = {
  isLoading: boolean;
};

export function FollowUpContent({ isLoading }: Props) {
  const timeZone = useTimeZone();
  const { setParams } = useFollowUpParams();
  const { followUp } = useFollowUpFormContext();

  return (
    <DashboardSheetContent
      bodyClassName=""
      title={
        followUp ? `Work follow-up: ${followUp.customerName}` : "Work follow-up"
      }
      header={
        <FollowUpSheetHeader
          followUp={isLoading ? undefined : followUp}
          timeZone={timeZone}
        />
      }
    >
      {isLoading ? (
        <SheetFormSkeleton fields={6} />
      ) : followUp ? (
        <div className="grid content-start gap-[18px] pt-[18px]">
          <dl className="grid grid-cols-1 gap-x-[18px] gap-y-3 rounded-xl border border-border bg-background px-4 py-3.5 sm:grid-cols-2">
            <Fact label="Customer">{followUp.customerName}</Fact>
            <Fact label="Service">
              {followUp.serviceTitle ?? "No job linked"}
            </Fact>
            <Fact label="Channel">
              {followUpChannelLabel(followUp.channel)}
            </Fact>
            <Fact label="Template">{followUp.templateName ?? "None"}</Fact>
          </dl>
          {followUp.notes ? (
            <p className="flex items-start gap-2.5 text-[13.5px] text-muted-foreground">
              <StickyNote
                aria-hidden="true"
                className="mt-0.5 size-[18px] shrink-0"
              />
              <span className="whitespace-pre-wrap break-words">
                {followUp.notes}
              </span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <AskAssistantButton
              kind="followUps"
              id={followUp.id}
              label={followUp.customerName}
              onOpen={() => setParams(null)}
            />
          </div>
          <FollowUpWorkForm key={followUp.id} followUp={followUp} />
          <FollowUpActivity followUp={followUp} timeZone={timeZone} />
        </div>
      ) : (
        <SheetMissingState
          title="Follow-up not found"
          description="This follow-up may have been completed, archived, or removed."
          onClose={() => setParams(null)}
        />
      )}
    </DashboardSheetContent>
  );
}

function Fact({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  );
}

const eventLabels: Record<string, string> = {
  assigned: "Assigned",
  closed: "Closed",
  created: "Planned",
  created_from_job: "Planned from job",
  followup_message_sent: "Contacted",
  replied: "Reply",
  rescheduled: "Rescheduled",
};

const eventIcons: Record<string, typeof Send> = {
  closed: Check,
  created: CalendarClock,
  created_from_job: CalendarClock,
  followup_message_sent: Send,
  replied: Reply,
  rescheduled: CalendarClock,
};

function FollowUpActivity({
  followUp,
  timeZone,
}: {
  followUp: FollowUp;
  timeZone: string;
}) {
  const events = [...followUp.events].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <section aria-labelledby="follow-up-history" className="grid">
      <h3 id="follow-up-history" className="mb-2.5 text-[13.5px] font-semibold">
        History
      </h3>
      {events.length === 0 ? (
        <p className="text-[13.5px] text-muted-foreground">
          Nothing recorded yet.
        </p>
      ) : (
        <ol className="grid">
          {events.map((event, index) => {
            const Icon = eventIcons[event.type] ?? StickyNote;
            const notes = eventNotes(event);
            const isReply = event.type === "replied";

            return (
              <li
                key={event.id}
                className="relative grid grid-cols-[30px_minmax(0,1fr)] gap-3 pb-4"
              >
                {index < events.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0.5 left-[14px] top-[30px] w-px bg-border"
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className={
                    isReply
                      ? "grid size-[30px] place-items-center rounded-full bg-[var(--wp-replied-soft,#e2f4e9)] text-[var(--wp-replied,#1d8148)] dark:bg-[var(--wp-replied-soft,#10301f)] dark:text-[var(--wp-replied,#4cc681)]"
                      : "grid size-[30px] place-items-center rounded-full border border-border bg-card text-muted-foreground"
                  }
                >
                  <Icon className="size-[15px]" />
                </span>
                <div className="grid gap-[3px] pt-1">
                  <p className="text-[13px] font-semibold">
                    {eventLabels[event.type] ?? event.type.replaceAll("_", " ")}
                  </p>
                  {notes ? (
                    <p
                      className={
                        isReply
                          ? "whitespace-pre-wrap break-words rounded-[4px_12px_12px_12px] bg-[var(--wp-replied-soft,#e2f4e9)] px-[11px] py-2 text-[13.5px] dark:bg-[var(--wp-replied-soft,#10301f)]"
                          : "whitespace-pre-wrap break-words text-[13.5px] text-muted-foreground"
                      }
                    >
                      {notes}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {formatStamp(event.createdAt, timeZone)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
