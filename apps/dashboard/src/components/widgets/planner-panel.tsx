import { cn } from "@afterservice/ui/cn";
import type { ReactNode } from "react";
import { useId } from "react";

type PlannerPanelProps = {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  count?: number;
  title: string;
};

export function PlannerPanel({
  action,
  children,
  className,
  count,
  title,
}: PlannerPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "min-w-0 rounded-[14px] border border-border bg-card px-4 py-4 text-card-foreground sm:px-5 sm:py-[18px]",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id={titleId}
          className="flex items-center text-[15px] font-semibold tracking-[-0.005em]"
        >
          {title}
          {count !== undefined ? <PlannerCount value={count} /> : null}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PlannerCount({ value }: { value: number }) {
  return (
    <span className="ml-2 inline-grid h-5 min-w-[22px] place-items-center rounded-full border border-border bg-background px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
      {value}
    </span>
  );
}

export function QuietEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="py-1.5 text-[13.5px] text-muted-foreground">{children}</p>
  );
}

export function InitialsAvatar({
  className,
  name,
  initials,
}: {
  className?: string;
  initials: string;
  name: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className={cn(
        "inline-grid size-8 shrink-0 place-items-center rounded-full bg-[var(--wp-teal-soft,#e1f1ef)] text-xs font-bold tracking-[0.02em] text-[var(--wp-teal-ink,#006966)] dark:bg-[var(--wp-teal-soft,#11302d)] dark:text-[var(--wp-teal-ink,#6dd3cd)]",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export const plannerLinkClassName =
  "rounded-sm text-sm font-semibold text-[var(--wp-teal-ink,#006966)] underline decoration-[color-mix(in_srgb,currentColor_35%,transparent)] underline-offset-[3px] hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-[var(--wp-teal-ink,#6dd3cd)]";
