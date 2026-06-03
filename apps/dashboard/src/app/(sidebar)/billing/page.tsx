import { BillingOverview } from "@/components/billing-overview";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";

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
    <ErrorBoundary>
      <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded-xl" />}>
        <BillingOverview />
      </Suspense>
    </ErrorBoundary>
  );
}
