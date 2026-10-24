"use client";

import {
  EmptyState as TableEmptyState,
  NoResults as TableNoResults,
} from "@/components/tables/core/empty-states";
import { useTemplateFilterParams } from "@/hooks/use-template-filter-params";
import { useTemplateParams } from "@/hooks/use-template-params";

export function EmptyState() {
  const { setParams } = useTemplateParams();

  return (
    <TableEmptyState
      title="No templates yet"
      description="Save wording you use often for check-ins, so staff start from a good message."
      actionLabel="Add template"
      onAction={() => setParams({ createTemplate: true })}
    />
  );
}

export function NoResults() {
  const { setFilter } = useTemplateFilterParams();

  return <TableNoResults onClear={() => setFilter(null)} />;
}
