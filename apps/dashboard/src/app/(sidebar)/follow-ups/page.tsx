import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { FollowUpsHeader } from "@/components/follow-ups-header";
import { DataTable } from "@/components/tables/follow-ups/data-table";
import { FollowUpsBoard } from "@/components/boards/follow-ups-board";
import { loadFollowUpFilterParams } from "@/hooks/use-follow-up-filter-params";
import { loadSortParams } from "@/hooks/use-sort-params";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Follow-ups | After Service",
  description: "Manage and track follow-ups.",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function FollowUpsPage(props: Props) {
  const searchParams = await props.searchParams;

  const filter = loadFollowUpFilterParams(searchParams);
  const { sort } = loadSortParams(searchParams);

  batchPrefetch([
    trpc.followUps.listTable.queryOptions({
      search: filter.q ?? undefined,
    }),
    trpc.followUps.listBoard.queryOptions(),
  ]);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <FollowUpsHeader />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <section className="space-y-8 min-w-0">
              <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading board...</div>}>
                <FollowUpsBoard />
              </Suspense>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Follow-up history</h2>
                <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading history...</div>}>
                  <DataTable />
                </Suspense>
              </div>
            </section>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}
