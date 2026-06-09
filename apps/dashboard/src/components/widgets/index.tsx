"use client";

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

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (!data) return null;

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
