"use client";

import { cn } from "@afterservice/ui/cn";
import { ArrowLeftRight } from "lucide-react";
import type { ReactNode } from "react";

interface TableFrameProps {
  children: ReactNode;
  /** Show the phone-only sideways scroll cue */
  scrollable?: boolean;
  className?: string;
}

/**
 * Boxed Wall planner table surface. Horizontal overflow stays inside the
 * frame; phones get a short cue that more columns sit to the side.
 */
export function TableFrame({
  children,
  scrollable = true,
  className,
}: TableFrameProps) {
  return (
    <div className={cn("wp-table-frame", className)}>
      {scrollable ? (
        <p className="wp-table-hint">
          <ArrowLeftRight className="size-3.5 shrink-0" aria-hidden />
          Swipe sideways to see more columns.
        </p>
      ) : null}
      {children}
    </div>
  );
}
