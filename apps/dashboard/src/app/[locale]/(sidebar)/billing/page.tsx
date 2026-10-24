import { resolveRequestPricing } from "@afterservice/plans/checkout";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import {
  BillingOverview,
  BillingOverviewSkeleton,
} from "@/components/billing-overview";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { ScrollableContent } from "@/components/scrollable-content";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Billing | afterservice",
  description: "Manage your subscription and billing details.",
};

export default async function BillingPage() {
  const headerList = await headers();
  const initialPricing = resolveRequestPricing(headerList);

  batchPrefetch([trpc.billing.getCurrentPlan.queryOptions()]);

  return (
    <HydrateClient>
      <ScrollableContent>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<BillingOverviewSkeleton />}>
            <BillingOverview initialPricing={initialPricing} />
          </Suspense>
        </ErrorBoundary>
      </ScrollableContent>
    </HydrateClient>
  );
}
