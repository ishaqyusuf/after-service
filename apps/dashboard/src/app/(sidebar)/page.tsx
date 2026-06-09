import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { OverviewView } from "@/components/widgets";

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
    <ErrorBoundary>
      <Suspense
        fallback={<div className="animate-pulse h-64 bg-muted rounded-xl" />}
      >
        <OverviewView />
      </Suspense>
    </ErrorBoundary>
  );
}
