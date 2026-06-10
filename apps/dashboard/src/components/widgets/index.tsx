"use client";

import { Button, Card, CardContent } from "@afterservice/ui";
import { useRouter } from "next/navigation";
import { trpc } from "@/components/providers/trpc-provider";
import { ChannelCards } from "./channel-cards";
import { FollowUpHealthCard } from "./follow-up-health-card";
import { OverviewHeader } from "./overview-header";
import { OverviewSkeleton } from "./overview-skeleton";
import { PriorityFollowUps } from "./priority-follow-ups";
import { RecentJobs } from "./recent-jobs";
import { WidgetCards } from "./widget-cards";
import { WorkloadCard } from "./workload-card";

export function OverviewView() {
  const { data, isLoading } = trpc.dashboard.overview.useQuery();
  const router = useRouter();

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (!data) return <OverviewEmptyState onRetry={() => router.refresh()} />;

  return (
    <div className="space-y-6">
      <OverviewHeader data={data} />
      <WidgetCards data={data} />
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <WorkloadCard data={data} />
        <FollowUpHealthCard data={data} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <PriorityFollowUps data={data} />
        <RecentJobs data={data} />
      </section>
      <ChannelCards data={data} />
    </div>
  );
}

function OverviewEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <section className="border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Workspace activity is not available yet.
        </p>
      </section>

      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">No overview data found</p>
            <p className="max-w-xl text-sm text-muted-foreground">
              Refresh the dashboard to load counts, recent jobs, and follow-up
              health for this workspace.
            </p>
          </div>
          <Button variant="outline" onClick={onRetry}>
            Refresh dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
