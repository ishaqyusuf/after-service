import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { OverviewView } from "@/components/widgets";
import { OverviewSkeleton } from "@/components/widgets/overview-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dashboard Overview | After Service",
    description: "Overview of your workspace performance.",
  };
}

export default async function DashboardPage() {
  // TODO: Add trpc prefetch here when ready
  // await trpc.dashboard.getOverview.prefetch();

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewView />
      </Suspense>
    </ErrorBoundary>
  );
}
