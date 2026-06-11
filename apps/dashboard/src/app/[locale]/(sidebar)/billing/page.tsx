import {
  getHeaderPricingHints,
  PRICING_REGION_COOKIE,
  resolvePricingRegion,
} from "@afterservice/plans";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
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
  const cookieStore = await cookies();
  const headerList = await headers();
  const { continent, country } = getHeaderPricingHints(headerList);
  const initialPricing = resolvePricingRegion({
    continent,
    cookieRegion: cookieStore.get(PRICING_REGION_COOKIE)?.value,
    country,
  });

  batchPrefetch([
    trpc.billing.getCurrentPlan.queryOptions(),
    trpc.billing.getPortalUrl.queryOptions(),
  ]);

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
