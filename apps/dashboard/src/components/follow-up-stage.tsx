import { cn } from "@afterservice/ui/cn";

// Board stages mirror the server's followUpStage() in @afterservice/db.
export const followUpStages = [
  "due",
  "upcoming",
  "waiting",
  "replied",
  "closed",
] as const;

export type FollowUpStage = (typeof followUpStages)[number];

export const followUpStageLabels: Record<FollowUpStage, string> = {
  closed: "Closed",
  due: "Due today",
  replied: "Replied",
  upcoming: "Upcoming",
  waiting: "Waiting",
};

export const followUpStageHints: Record<FollowUpStage, string> = {
  closed: "Done, with a closing note for next time.",
  due: "The date has arrived or passed. Overdue items stay here until someone acts.",
  replied: "The customer answered. Decide the next step.",
  upcoming: "Planned for a later date.",
  waiting: "Contacted. Waiting for the customer to reply.",
};

// Maps a board stage to its key in followUps.listBoard().columns.
export const followUpStageColumns = {
  closed: "closed",
  due: "dueToday",
  replied: "replied",
  upcoming: "upcoming",
  waiting: "waiting",
} as const satisfies Record<FollowUpStage, string>;

const stageDotClassNames: Record<FollowUpStage, string> = {
  closed:
    "border-[1.5px] border-[var(--wp-closed,#84948f)] bg-transparent dark:border-[var(--wp-closed,#6c7d78)]",
  due: "bg-[var(--wp-due,#e0482f)] dark:bg-[var(--wp-due,#ff6a50)]",
  replied:
    "bg-[var(--wp-replied,#1d8148)] shadow-[inset_0_0_0_2px_hsl(var(--card)),0_0_0_1.5px_var(--wp-replied,#1d8148)] dark:bg-[var(--wp-replied,#4cc681)] dark:shadow-[inset_0_0_0_2px_hsl(var(--card)),0_0_0_1.5px_var(--wp-replied,#4cc681)]",
  upcoming:
    "border-2 border-[var(--wp-upcoming,#b97f00)] bg-[var(--wp-upcoming-soft,#fff3d1)] dark:border-[var(--wp-upcoming,#e3ae38)] dark:bg-[var(--wp-upcoming-soft,#33280e)]",
  waiting:
    "border-2 border-[var(--wp-waiting,#2f63cc)] bg-[linear-gradient(90deg,var(--wp-waiting,#2f63cc)_50%,transparent_50%)] dark:border-[var(--wp-waiting,#719cff)] dark:bg-[linear-gradient(90deg,var(--wp-waiting,#719cff)_50%,transparent_50%)]",
};

export const overdueTextClassName =
  "font-semibold text-[var(--wp-due-ink,#b23119)] dark:text-[var(--wp-due-ink,#ff8c78)]";

export function StageDot({
  className,
  stage,
}: {
  className?: string;
  stage: FollowUpStage;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "box-border inline-block size-[11px] shrink-0 rounded-full",
        stageDotClassNames[stage],
        className,
      )}
    />
  );
}

type StageStickerProps = {
  className?: string;
  // Hidden labels stay available to assistive technology.
  showLabel?: boolean;
  stage: FollowUpStage;
};

export function StageSticker({
  className,
  showLabel = true,
  stage,
}: StageStickerProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] whitespace-nowrap text-[13px] font-semibold",
        stage === "closed" ? "text-muted-foreground" : "text-foreground",
        className,
      )}
    >
      <StageDot stage={stage} />
      <span className={showLabel ? undefined : "sr-only"}>
        {followUpStageLabels[stage]}
      </span>
    </span>
  );
}

export function toFollowUpStage(
  status: string,
  dueDay: string,
  today: string,
): FollowUpStage {
  if (status === "closed") return "closed";
  if (status === "replied") return "replied";
  if (status === "sent") return "waiting";
  return dueDay <= today ? "due" : "upcoming";
}
