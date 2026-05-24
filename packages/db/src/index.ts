export type WorkspacePlan = "starter" | "growth" | "pro";

export type WorkspacePlanStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing";

export type WorkspaceIdentity = {
  id: string;
  name: string;
  plan: WorkspacePlan;
  planStatus: WorkspacePlanStatus;
  slug: string;
};
