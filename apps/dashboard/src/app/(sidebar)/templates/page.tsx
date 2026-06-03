import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { TemplatesHeader } from "@/components/templates-header";
import { DataTable } from "@/components/tables/templates/data-table";
import { loadTemplateFilterParams } from "@/hooks/use-template-filter-params";
import { loadSortParams } from "@/hooks/use-sort-params";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Templates | After Service",
  description: "Manage your follow-up templates.",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function TemplatesPage(props: Props) {
  const searchParams = await props.searchParams;

  const filter = loadTemplateFilterParams(searchParams);
  const { sort } = loadSortParams(searchParams);

  batchPrefetch([
    trpc.templates.list.queryOptions({
      search: filter.q ?? undefined,
    }),
  ]);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <TemplatesHeader />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading templates...</div>}>
              <DataTable />
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
