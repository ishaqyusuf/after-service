import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import type { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { CustomersHeader } from "@/components/customers-header";
import { DataTable } from "@/components/tables/customers/data-table";
import { loadCustomerFilterParams } from "@/hooks/use-customer-filter-params";
import { loadSortParams } from "@/hooks/use-sort-params";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Customers | After Service",
  description: "Manage your customer base.",
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function CustomersPage(props: Props) {
  const searchParams = await props.searchParams;

  const filter = loadCustomerFilterParams(searchParams);
  const { sort } = loadSortParams(searchParams);

  batchPrefetch([
    trpc.customers.list.queryOptions({
      search: filter.q ?? undefined,
      includeArchived: false,
    }),
  ]);

  return (
    <HydrateClient>
      <ScrollableContent>
        <div className="flex flex-col gap-6">
          <CustomersHeader />

          <ErrorBoundary errorComponent={ErrorFallback}>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading customers...</div>}>
              <DataTable />
            </Suspense>
          </ErrorBoundary>
        </div>
      </ScrollableContent>
    </HydrateClient>
  );
}

