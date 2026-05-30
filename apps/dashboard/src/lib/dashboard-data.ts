import type { WorkspacePlan } from "@afterservice/db";
import { redirect } from "next/navigation";
import { getServerCaller } from "./trpc-server";

export const planLimits: Record<
  WorkspacePlan,
  {
    customers: number;
    followUps: number;
    teamMembers: number;
    templates: number;
  }
> = {
  growth: {
    customers: 1000,
    followUps: 3000,
    teamMembers: 5,
    templates: 25,
  },
  pro: {
    customers: 10000,
    followUps: 25000,
    teamMembers: 25,
    templates: 100,
  },
  starter: {
    customers: 100,
    followUps: 200,
    teamMembers: 1,
    templates: 5,
  },
};

export async function getWorkspaceSummary() {
  try {
    const caller = await getServerCaller();
    return caller.workspace.getCurrent();
  } catch {
    redirect("/onboarding");
  }
}

export async function getDashboardOverview() {
  const caller = await getServerCaller();
  const workspace = await caller.workspace.getCurrent();
  const customers = await caller.customers.list({ includeArchived: false });
  const jobs = await caller.serviceJobs.list();
  const followUps = await caller.followUps.listTable({});
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return {
    counts: {
      customers: customers.items.length,
      dueToday: followUps.items.filter(
        (item) =>
          item.status !== "closed" &&
          item.status !== "replied" &&
          new Date(item.dueAt) <= todayEnd,
      ).length,
      jobs: jobs.items.length,
      openFollowUps: followUps.items.filter((item) => item.status !== "closed")
        .length,
    },
    recentFollowUps: followUps.items.slice(0, 8),
    workspace: workspace.item,
  };
}

export async function getCustomers(search?: string) {
  const caller = await getServerCaller();
  const result = await caller.customers.list({
    includeArchived: false,
    search,
  });

  return result.items;
}

export async function getJobsData() {
  const caller = await getServerCaller();
  const customers = await caller.customers.list({ includeArchived: false });
  const jobs = await caller.serviceJobs.list();
  const templates = await caller.templates.list();
  const workspace = await caller.workspace.getCurrent();

  return {
    customers: customers.items,
    jobs: jobs.items,
    templates: templates.items,
    workspace: workspace.item,
  };
}

export async function getFollowUpsData() {
  const caller = await getServerCaller();
  const customers = await caller.customers.list({ includeArchived: false });
  const jobs = await caller.serviceJobs.list();
  const templates = await caller.templates.list();
  const board = await caller.followUps.listBoard();
  const table = await caller.followUps.listTable({});
  const workspace = await caller.workspace.getCurrent();

  return {
    columns: board.columns,
    customers: customers.items,
    followUps: table.items,
    jobs: jobs.items,
    templates: templates.items,
    workspace: workspace.item,
  };
}

export async function getTemplatesData() {
  const caller = await getServerCaller();
  const templates = await caller.templates.list();
  const customers = await caller.customers.list({ includeArchived: false });
  const jobs = await caller.serviceJobs.list();
  const workspace = await caller.workspace.getCurrent();

  return {
    sampleCustomer: customers.items[0] ?? null,
    sampleJob: jobs.items[0] ?? null,
    templates: templates.items,
    workspace: workspace.item,
  };
}

export async function getBillingData() {
  const caller = await getServerCaller();
  const billing = await caller.billing.getCurrentPlan();

  return {
    checkoutUrl: process.env.LEMON_SQUEEZY_CHECKOUT_URL ?? null,
    ...billing.item,
  };
}

export async function getSettingsData() {
  const caller = await getServerCaller();
  const workspace = await caller.workspace.getCurrent();

  return { workspace: workspace.item };
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function centsToDollars(cents: number | null | undefined) {
  if (!cents) return "";
  return new Intl.NumberFormat("en", {
    currency: "USD",
    style: "currency",
  }).format(cents / 100);
}

export function resolveTemplate(
  body: string,
  input: {
    businessName: string;
    completionDate?: Date | string | null;
    customerName?: string | null;
    serviceName?: string | null;
  },
) {
  return body
    .replaceAll("{{customer.name}}", input.customerName ?? "Customer")
    .replaceAll("{{customer_name}}", input.customerName ?? "Customer")
    .replaceAll("{{business_name}}", input.businessName)
    .replaceAll("{{job.title}}", input.serviceName ?? "recent service")
    .replaceAll("{{service_name}}", input.serviceName ?? "recent service")
    .replaceAll(
      "{{completion_date}}",
      input.completionDate ? formatDate(input.completionDate) : "recently",
    );
}
