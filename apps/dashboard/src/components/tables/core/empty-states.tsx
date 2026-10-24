"use client";

import { Button } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Title to display */
  title: string;
  /** Description text (can include line breaks with <br />) */
  description: ReactNode;
  /** Label for the action button */
  actionLabel: string;
  /** Callback when action button is clicked */
  onAction: () => void;
  /** "empty" for a first-run table, "no-results" when filters hide every row */
  variant?: "empty" | "no-results";
}

/**
 * Generic empty state component for tables
 * Used when there is no data to display
 */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = "empty",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start gap-x-6 gap-y-4 rounded-[14px] border-[1.5px] border-dashed border-[color:var(--wp-line-2)] px-5 py-6 sm:px-6 sm:py-7",
        variant === "no-results" && "bg-[color:var(--wp-paper)]",
      )}
    >
      <div className="min-w-0 flex-[1_1_280px] space-y-1">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="max-w-[60ch] text-sm leading-relaxed text-[color:var(--wp-ink-2)]">
          {description}
        </p>
      </div>

      <Button
        variant={variant === "empty" ? "default" : "outline"}
        className={cn(
          "h-11 w-full self-center rounded-[10px] px-4 font-semibold sm:w-auto md:h-10",
          variant === "no-results" &&
            "border-[color:var(--wp-line-2)] bg-[color:var(--wp-paper)] hover:border-[color:var(--wp-ink-3)] hover:bg-[color:var(--wp-paper)]",
        )}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

interface NoResultsProps {
  /** Callback to clear filters */
  onClear: () => void;
}

/**
 * No results state for filtered tables
 * Used when filters return no matches
 */
export function NoResults({ onClear }: NoResultsProps) {
  return (
    <EmptyState
      variant="no-results"
      title="Nothing matches these filters"
      description="Try a different search, or clear the filters to see everything."
      actionLabel="Clear filters"
      onAction={onClear}
    />
  );
}
