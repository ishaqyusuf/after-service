"use client";

import {
  EmptyState as TableEmptyState,
  NoResults as TableNoResults,
} from "@/components/tables/core/empty-states";
import { useJobFilterParams } from "@/hooks/use-job-filter-params";
import { useJobParams } from "@/hooks/use-job-params";

export function EmptyState() {
  const { setParams } = useJobParams();

  return (
    <TableEmptyState
      title="No jobs recorded"
      description="Record work as it wraps up, then plan the customer check-in that follows."
      actionLabel="Add job"
      onAction={() => setParams({ createJob: true })}
    />
  );
}

export function NoResults() {
  const { setFilter } = useJobFilterParams();

  return <TableNoResults onClear={() => setFilter(null)} />;
}
