import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { JobsHeader } from "@/components/jobs-header";
import { DataTable } from "@/components/tables/jobs/data-table";
import { loadJobFilterParams } from "@/hooks/use-job-filter-params";
import { loadSortParams } from "@/hooks/use-sort-params";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Jobs | After Service",
  description: "Record completed services.",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function JobsPage(props: Props) {
  const searchParams = await props.searchParams;

  const filter = loadJobFilterParams(searchParams);
  const { sort } = loadSortParams(searchParams);

  batchPrefetch([
    trpc.serviceJobs.list.queryOptions({
      q: filter.q ?? undefined,
      customers: filter.customers ?? undefined,
      status: filter.status ?? undefined,
      start: filter.start ?? undefined,
      end: filter.end ?? undefined,
    }),
  ]);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <JobsHeader />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading jobs...</div>}>
              <DataTable />
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
