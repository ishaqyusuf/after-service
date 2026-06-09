import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BillingOverview,
  BillingOverviewSkeleton,
} from "@/components/billing-overview";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Billing | After Service",
    description: "Manage your subscription and billing details.",
  };
}

export default async function BillingPage() {
  // TODO: Add trpc prefetch here when ready
  // await trpc.billing.getOverview.prefetch();

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<BillingOverviewSkeleton />}>
        <BillingOverview />
      </Suspense>
    </ErrorBoundary>
  );
}
