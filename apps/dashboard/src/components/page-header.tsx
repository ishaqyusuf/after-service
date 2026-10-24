import { cn } from "@afterservice/ui/cn";
import type { ReactNode } from "react";

/** Primary page action (create buttons). Stays full-size and visible on phones. */
export const PAGE_ACTION_CLASS =
  "h-11 gap-2 rounded-[10px] px-4 font-semibold shadow-none md:h-10 [&_svg]:size-[18px]";

/** Secondary toolbar control (column settings, filters). 44px touch target on phones. */
export const TOOLBAR_CONTROL_CLASS =
  "size-11 shrink-0 rounded-[10px] border-[color:var(--wp-line-2)] bg-[color:var(--wp-paper)] text-[color:var(--wp-ink-2)] hover:border-[color:var(--wp-ink-3)] hover:bg-[color:var(--wp-paper)] hover:text-foreground md:size-10";

/**
 * Wall planner page head: Cal Sans title, short supporting copy,
 * a wrapping action group and an optional toolbar below.
 */
export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="grid min-w-0 gap-1.5">
          <h1 className="wp-display text-[26px] leading-[1.1] text-foreground md:text-[30px]">
            {title}
          </h1>
          {description ? (
            <p className="max-w-[70ch] text-[14.5px] leading-normal text-[color:var(--wp-ink-2)]">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
            {actions}
          </div>
        ) : null}
      </div>

      {children}
    </div>
  );
}

/** Search + filter row. The search grows; trailing controls keep their size. */
export function PageToolbar({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 items-start gap-2">{children}</div>;
}
