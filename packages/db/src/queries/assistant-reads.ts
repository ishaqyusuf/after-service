import {
  type AssistantCard,
  type AssistantRead,
  type AssistantScope,
  helpText,
  type RecordCard,
  statedTimeToIso,
} from "@afterservice/assistant";
import type { Prisma } from "../../generated/prisma/client";
import {
  type AssistantDb,
  AssistantError,
  requireAssistantScope,
} from "./assistant-store";
import { calendarDay } from "./follow-up-calendar";

function clip(value: string | null | undefined) {
  return value?.slice(0, 600) ?? "";
}
function card(
  title: string,
  records: RecordCard["records"],
  asOf: string,
  nextCursor?: string | null,
): RecordCard {
  return { kind: "records", title, records, asOf, nextCursor };
}
export async function readAssistantWorkspace(
  db: AssistantDb,
  scope: AssistantScope,
  input: AssistantRead,
  timeZone: string,
): Promise<AssistantCard> {
  const member = await requireAssistantScope(db, scope);
  const workspaceId = scope.workspaceId;
  const asOf = new Date().toISOString();
  const contains = input.query
    ? { contains: input.query, mode: "insensitive" as const }
    : undefined;
  const paging = {
    take: 11,
    orderBy: { id: "asc" as const },
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  };
  if (input.kind === "help")
    return { kind: "message", title: "Using afterservice", body: helpText };
  if (input.kind === "customers") {
    const rows = await db.customer.findMany({
      ...paging,
      where: {
        workspaceId,
        archivedAt: null,
        id: input.id,
        ...(contains
          ? {
              OR: [
                { name: contains },
                { email: contains },
                { phone: contains },
              ],
            }
          : {}),
      },
      include: {
        jobs: {
          orderBy: { completedAt: "desc" },
          take: 3,
          select: { id: true, title: true, completedAt: true },
        },
        followUps: {
          orderBy: { dueAt: "desc" },
          take: 3,
          select: { id: true, status: true, dueAt: true },
        },
      },
    });
    return card(
      "Customers",
      rows.slice(0, 10).map((v) => ({
        id: v.id,
        label: v.name,
        detail: clip(
          [
            v.email,
            v.phone,
            v.companyName,
            v.tags.join(", "),
            v.notes,
            ...v.jobs.map((j) => `${j.title} (${j.completedAt.toISOString()})`),
            ...v.followUps.map((f) => `${f.status} ${f.dueAt.toISOString()}`),
          ]
            .filter(Boolean)
            .join(" · "),
        ),
        href: `/customers?customerId=${v.id}&editCustomer=true`,
      })),
      asOf,
      rows.length > 10 ? rows[9]!.id : null,
    );
  }
  if (input.kind === "messages") {
    const rows = await db.messageLog.findMany({
      ...paging,
      where: {
        workspaceId,
        id: input.id,
        customerId: input.customerId,
        followUpId: input.followUpId,
      },
    });
    return card(
      "Recorded contact history",
      rows.slice(0, 10).map((row) => ({
        id: row.id,
        label: `${row.channel} · ${row.status}`,
        detail: clip(
          `${row.createdAt.toISOString()} · ${row.subject ?? ""} · ${row.body}`,
        ),
        href: row.followUpId
          ? `/follow-ups?followUpId=${row.followUpId}`
          : "/customers",
      })),
      asOf,
      rows.length > 10 ? rows[9]?.id : null,
    );
  }
  if (input.kind === "jobs") {
    const rows = await db.serviceJob.findMany({
      ...paging,
      where: {
        workspaceId,
        id: input.id,
        customerId: input.customerId,
        ...(contains
          ? { OR: [{ title: contains }, { customer: { name: contains } }] }
          : {}),
      },
      include: { customer: { select: { name: true } } },
    });
    return card(
      "Service jobs",
      rows.slice(0, 10).map((v) => ({
        id: v.id,
        label: v.title,
        detail: clip(
          `${v.customer.name} · ${v.status} · ${v.completedAt.toISOString()}${v.amountCents === null ? "" : ` · ${v.currency} ${(v.amountCents / 100).toFixed(2)}`} · ${v.notes ?? ""}`,
        ),
        href: `/jobs?assistantContext=job:${v.id}`,
      })),
      asOf,
      rows.length > 10 ? rows[9]!.id : null,
    );
  }
  if (input.kind === "followUps") {
    const now = new Date();
    const today = calendarDay(now, timeZone);
    const start = new Date(statedTimeToIso(`${today}T00:00`, timeZone));
    const nextDay = new Date(`${today}T12:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const end = new Date(
      statedTimeToIso(`${nextDay.toISOString().slice(0, 10)}T00:00`, timeZone),
    );
    const stage = input.status;
    const status: Prisma.FollowUpWhereInput["status"] =
      stage === "waiting"
        ? "sent"
        : stage === "replied"
          ? "replied"
          : stage === "closed"
            ? "closed"
            : stage
              ? { in: ["open", "scheduled", "missed"] }
              : undefined;
    const dueAt =
      stage === "overdue"
        ? { lt: start }
        : stage === "due"
          ? { lt: end }
          : stage === "upcoming"
            ? { gte: end }
            : undefined;
    const rows = await db.followUp.findMany({
      ...paging,
      where: {
        workspaceId,
        id: input.id,
        customerId: input.customerId,
        status,
        dueAt,
        ...(contains
          ? {
              OR: [
                { customer: { name: contains } },
                { job: { title: contains } },
                { notes: contains },
              ],
            }
          : {}),
      },
      include: {
        customer: { select: { name: true } },
        job: { select: { title: true } },
      },
    });
    return card(
      "Follow-ups",
      rows.slice(0, 10).map((v) => ({
        id: v.id,
        label: v.customer.name,
        detail: clip(
          `${v.job?.title ?? "Check-in"} · ${v.status} · ${v.channel} · due ${v.dueAt.toISOString()} · ${v.notes ?? ""}`,
        ),
        href: `/follow-ups?followUpId=${v.id}`,
      })),
      asOf,
      rows.length > 10 ? rows[9]!.id : null,
    );
  }
  if (input.kind === "templates") {
    const rows = await db.followUpTemplate.findMany({
      ...paging,
      where: {
        workspaceId,
        id: input.id,
        ...(contains ? { name: contains } : {}),
      },
    });
    return card(
      "Message templates",
      rows.slice(0, 10).map((v) => ({
        id: v.id,
        label: v.name,
        detail: clip(
          `${v.channel}${v.isDefault ? " · default" : ""} · ${v.subject ?? ""} · ${v.body}`,
        ),
        href: `/templates?templateId=${v.id}`,
      })),
      asOf,
      rows.length > 10 ? rows[9]!.id : null,
    );
  }
  if (input.kind === "members") {
    const rows = await db.membership.findMany({
      ...paging,
      where: { workspaceId, ...(contains ? { user: { name: contains } } : {}) },
      select: { id: true, role: true, user: { select: { name: true } } },
    });
    return card(
      "Follow-up assignees",
      rows.slice(0, 10).map((v) => ({
        id: v.id,
        label: v.user.name || "Team member",
        detail: v.role,
        href: "/follow-ups",
      })),
      asOf,
      rows.length > 10 ? rows[9]!.id : null,
    );
  }
  if (input.kind === "settings") {
    const ws = await db.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: {
        name: true,
        businessType: true,
        serviceCategory: true,
        defaultFollowUpDelayDays: true,
      },
    });
    return {
      kind: "summary",
      title: "Workspace settings",
      asOf,
      facts: Object.entries(ws).map(([label, value]) => ({
        label,
        value: String(value ?? "Not set"),
      })),
      links: [{ label: "Open settings", href: "/settings" }],
    };
  }
  if (input.kind === "billing") {
    const ws = await db.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { plan: true, planStatus: true },
    });
    const [customers, followUps, templates] = await Promise.all([
      db.customer.count({ where: { workspaceId, archivedAt: null } }),
      db.followUp.count({ where: { workspaceId } }),
      db.followUpTemplate.count({ where: { workspaceId } }),
    ]);
    return {
      kind: "summary",
      title: "Plan and usage",
      asOf,
      facts: [
        { label: "Plan", value: ws.plan },
        { label: "Status", value: ws.planStatus },
        { label: "Customers", value: String(customers) },
        { label: "Follow-ups", value: String(followUps) },
        { label: "Templates", value: String(templates) },
        {
          label: "Checkout",
          value:
            process.env.AFTERSERVICE_PAID_CHECKOUT_ENABLED === "true"
              ? "Available through billing"
              : "Free Beta — paid checkout is disabled",
        },
      ],
      links: [
        {
          label:
            member.role === "staff"
              ? "View plan and limits"
              : "Open billing and portal",
          href: "/billing",
        },
      ],
    };
  }
  const today = calendarDay(new Date(), timeZone);
  const from = input.from ?? today;
  const to = input.to ?? today;
  if (input.kind === "report" && (!input.from || !input.to))
    throw new AssistantError(
      "BAD_REQUEST",
      "Choose the report start and end dates.",
    );
  if (from > to)
    throw new AssistantError(
      "BAD_REQUEST",
      "The report start date must come before the end date.",
    );
  const endDay = new Date(`${to}T12:00Z`);
  endDay.setUTCDate(endDay.getUTCDate() + 1);
  const start = new Date(statedTimeToIso(`${from}T00:00`, timeZone));
  const end = new Date(
    statedTimeToIso(`${endDay.toISOString().slice(0, 10)}T00:00`, timeZone),
  );
  if (end.getTime() - start.getTime() > 366 * 86400000)
    throw new AssistantError(
      "BAD_REQUEST",
      "Choose a report period of at most one year.",
    );
  const [jobs, contacts, replies, closed, overdue, due, waiting, customers] =
    await Promise.all([
      db.serviceJob.count({
        where: { workspaceId, completedAt: { gte: start, lt: end } },
      }),
      db.messageLog.count({
        where: {
          workspaceId,
          createdAt: { gte: start, lt: end },
          status: { in: ["sent", "delivered", "queued"] },
        },
      }),
      db.followUpEvent.count({
        where: {
          workspaceId,
          type: "replied",
          createdAt: { gte: start, lt: end },
        },
      }),
      db.followUpEvent.count({
        where: {
          workspaceId,
          type: "closed",
          createdAt: { gte: start, lt: end },
        },
      }),
      db.followUp.count({
        where: {
          workspaceId,
          status: { in: ["open", "scheduled", "missed"] },
          dueAt: { lt: start },
        },
      }),
      db.followUp.count({
        where: {
          workspaceId,
          status: { in: ["open", "scheduled", "missed"] },
          dueAt: { gte: start, lt: end },
        },
      }),
      db.followUp.count({ where: { workspaceId, status: "sent" } }),
      db.customer.count({ where: { workspaceId, archivedAt: null } }),
    ]);
  const channels = await db.followUp.groupBy({
    by: ["channel"],
    where: { workspaceId, dueAt: { gte: start, lt: end } },
    _count: { _all: true },
  });
  return {
    kind: "summary",
    title: input.kind === "report" ? "Operations report" : "Today's workload",
    asOf,
    facts: [
      { label: "Period", value: `${from}–${to} (${timeZone})` },
      { label: "Completed jobs in period", value: String(jobs) },
      {
        label: "Recorded contacts in period (not delivery proof)",
        value: String(contacts),
      },
      { label: "Reply events in period", value: String(replies) },
      { label: "Closure events in period", value: String(closed) },
      { label: "Outstanding due in period", value: String(due) },
      { label: "Outstanding due before period", value: String(overdue) },
      { label: "Waiting for reply now", value: String(waiting) },
      { label: "Active customers now", value: String(customers) },
      ...channels.map((channel) => ({
        label: `Follow-ups due in period · ${channel.channel}`,
        value: String(channel._count._all),
      })),
    ],
    links: [
      { label: "Work follow-up board", href: "/follow-ups" },
      { label: "View jobs", href: "/jobs" },
    ],
  };
}
