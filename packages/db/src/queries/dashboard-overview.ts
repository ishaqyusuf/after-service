import type { PrismaClient } from "../../generated/prisma/client";
import { calendarDay, shiftCalendarDay } from "./follow-up-calendar";

const followUpStatuses = [
  "open",
  "scheduled",
  "sent",
  "replied",
  "closed",
  "missed",
] as const;

const followUpChannels = ["email", "sms", "phone", "whatsapp"] as const;

function iso(date: Date | null | undefined) {
  return date?.toISOString() ?? null;
}

function followUpDto(followUp: {
  assigneeId?: string | null;
  channel: string;
  closedAt?: Date | null;
  createdAt: Date;
  customer: { id: string; name: string };
  dueAt: Date;
  events?: Array<{
    actorId?: string | null;
    createdAt: Date;
    id: string;
    metadata?: unknown;
    type: string;
  }>;
  id: string;
  job?: { id: string; title: string } | null;
  messageLogs?: Array<{
    body: string;
    createdAt: Date;
    id: string;
    recipient: string;
    status: string;
  }>;
  notes?: string | null;
  sentAt?: Date | null;
  status: string;
  template?: { id: string; name: string } | null;
  updatedAt: Date;
}) {
  return {
    assigneeId: followUp.assigneeId ?? null,
    channel: followUp.channel,
    closedAt: iso(followUp.closedAt),
    createdAt: followUp.createdAt.toISOString(),
    customerId: followUp.customer.id,
    customerName: followUp.customer.name,
    dueAt: followUp.dueAt.toISOString(),
    events:
      followUp.events?.map((event) => ({
        actorId: event.actorId ?? null,
        createdAt: event.createdAt.toISOString(),
        id: event.id,
        metadata: event.metadata ?? null,
        type: event.type,
      })) ?? [],
    id: followUp.id,
    messageLogs:
      followUp.messageLogs?.map((log) => ({
        body: log.body,
        createdAt: log.createdAt.toISOString(),
        id: log.id,
        recipient: log.recipient,
        status: log.status,
      })) ?? [],
    notes: followUp.notes ?? null,
    sentAt: iso(followUp.sentAt),
    serviceTitle: followUp.job?.title ?? null,
    status: followUp.status,
    templateName: followUp.template?.name ?? null,
    updatedAt: followUp.updatedAt.toISOString(),
  };
}

export async function getDashboardOverview(
  db: PrismaClient,
  workspaceId: string,
  timeZone = "UTC",
) {
  const workspace = await db.workspace.findUniqueOrThrow({
    select: {
      businessType: true,
      defaultFollowUpDelayDays: true,
      id: true,
      name: true,
      plan: true,
      planStatus: true,
      serviceCategory: true,
      slug: true,
    },
    where: { id: workspaceId },
  });

  const customersCount = await db.customer.count({
    where: { archivedAt: null, workspaceId },
  });

  const jobsCount = await db.serviceJob.count({
    where: { workspaceId },
  });

  const recentJobs = await db.serviceJob.findMany({
    include: { customer: true },
    orderBy: { completedAt: "desc" },
    take: 5,
    where: { workspaceId },
  });

  const followUps = await db.followUp.findMany({
    include: { customer: true, job: true },
    where: { workspaceId },
    orderBy: { dueAt: "asc" },
  });

  const now = new Date();
  const today = calendarDay(now, timeZone);
  const nextWeek = shiftCalendarDay(today, 7);
  const weekStart = shiftCalendarDay(today, -6);

  const activeFollowUps = followUps.filter((item) =>
    ["open", "scheduled", "missed"].includes(item.status),
  );
  const dueToday = activeFollowUps.filter(
    (item) => calendarDay(item.dueAt, timeZone) === today,
  ).length;
  const openFollowUps = followUps.filter(
    (item) => item.status !== "closed",
  ).length;
  const overdueFollowUps = activeFollowUps.filter(
    (item) => calendarDay(item.dueAt, timeZone) < today,
  ).length;
  const upcomingFollowUps = activeFollowUps.filter(
    (item) =>
      calendarDay(item.dueAt, timeZone) > today &&
      calendarDay(item.dueAt, timeZone) <= nextWeek,
  ).length;
  const completedJobs = await db.serviceJob.findMany({
    select: { completedAt: true },
    // Read a one-day margin, then apply the exact local calendar boundary.
    where: {
      workspaceId,
      completedAt: {
        gte: new Date(`${shiftCalendarDay(weekStart, -1)}T00:00:00.000Z`),
      },
    },
  });
  const completedThisWeek = completedJobs.filter(
    (job) => calendarDay(job.completedAt, timeZone) >= weekStart,
  ).length;
  const sentThisWeek = followUps.filter(
    (item) => item.sentAt && calendarDay(item.sentAt, timeZone) >= weekStart,
  ).length;
  const resolvedFollowUps = followUps.filter(
    (item) => item.status === "closed" || item.status === "replied",
  ).length;

  return {
    counts: {
      customers: customersCount,
      completedThisWeek,
      dueToday,
      jobs: jobsCount,
      openFollowUps,
      overdueFollowUps,
      resolvedFollowUps,
      sentThisWeek,
      upcomingFollowUps,
    },
    followUpChannels: followUpChannels.map((channel) => ({
      channel,
      count: followUps.filter((item) => item.channel === channel).length,
    })),
    followUpStatuses: followUpStatuses.map((status) => ({
      count: followUps.filter((item) => item.status === status).length,
      status,
    })),
    recentFollowUps: followUps
      .filter((item) => item.status !== "closed")
      .slice(0, 8)
      .map((item) => followUpDto(item)),
    recentJobs: recentJobs.map((job) => ({
      amountCents: job.amountCents,
      completedAt: job.completedAt.toISOString(),
      customerName: job.customer.name,
      id: job.id,
      serviceCategory: job.serviceCategory,
      status: job.status,
      title: job.title,
    })),
    workspace,
  };
}
