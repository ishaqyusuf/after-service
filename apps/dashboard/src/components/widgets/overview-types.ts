import type { AppRouter } from "@afterservice/api/router";
import type { inferRouterOutputs } from "@trpc/server";

export type DashboardOverviewData =
  inferRouterOutputs<AppRouter>["dashboard"]["overview"];

export type FollowUpStatus =
  DashboardOverviewData["followUpStatuses"][number]["status"];

export type FollowUpChannel =
  DashboardOverviewData["followUpChannels"][number]["channel"];
