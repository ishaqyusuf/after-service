"use client";

import {
  EmptyState as TableEmptyState,
  NoResults as TableNoResults,
} from "@/components/tables/core/empty-states";
import { useCustomerFilterParams } from "@/hooks/use-customer-filter-params";
import { useCustomerParams } from "@/hooks/use-customer-params";

export function EmptyState() {
  const { setParams } = useCustomerParams();

  return (
    <TableEmptyState
      title="No customers yet"
      description="Add the people you've done work for. Each customer keeps their jobs, follow-ups and message history together."
      actionLabel="Add customer"
      onAction={() => setParams({ createCustomer: true })}
    />
  );
}

export function NoResults() {
  const { setFilter } = useCustomerFilterParams();

  return <TableNoResults onClear={() => setFilter(null)} />;
}
