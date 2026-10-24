import type { AppRouter } from "@afterservice/api/router";
import type { inferRouterOutputs } from "@trpc/server";

export type DashboardOverviewData =
  inferRouterOutputs<AppRouter>["dashboard"]["overview"];

export type FollowUpBoardColumns =
  inferRouterOutputs<AppRouter>["followUps"]["listBoard"]["columns"];

export type FollowUpBoardItem =
  FollowUpBoardColumns[keyof FollowUpBoardColumns][number];
