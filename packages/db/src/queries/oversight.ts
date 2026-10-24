import { getAdoptionExcludedWorkspaceIds } from "@afterservice/utils";
import type { Prisma, PrismaClient } from "../index";

function reportingPopulation() {
  const excludedWorkspaceIds = getAdoptionExcludedWorkspaceIds(process.env);
  const live = {
    dataClassification: "normal",
    qaPurgeStartedAt: null,
    AND: [{ id: { notIn: excludedWorkspaceIds } }],
  } satisfies Prisma.WorkspaceWhereInput;
  const accounts = {
    OR: [
      { memberships: { none: {} } },
      { memberships: { some: { workspace: live } } },
    ],
  } satisfies Prisma.UserWhereInput;
  return { accounts, excludedWorkspaceIds, live };
}

export type OversightDirectoryInput = { search: string; cursor?: string };

function page<T extends { id: string }>(rows: T[]) {
  return {
    items: rows.slice(0, 50),
    nextCursor: rows.length > 50 ? (rows[49]?.id ?? null) : null,
  };
}

export async function getOversightSummary(
  db: PrismaClient,
  days: 7 | 30 | 90,
  to = new Date(),
) {
  const { accounts, excludedWorkspaceIds, live } = reportingPopulation();
  const from = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() - days + 1),
  );
  const createdAt = { gte: from, lte: to };
  return db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SET TRANSACTION READ ONLY`;
      await tx.$executeRaw`SET LOCAL TIME ZONE 'UTC'`;
      const [
        businesses,
        users,
        newUsers,
        orders,
        newBusinesses,
        customers,
        followUps,
        overdueFollowUps,
        userDays,
        jobDays,
      ] = await Promise.all([
        tx.workspace.count({ where: live }),
        tx.user.count({ where: accounts }),
        tx.user.count({ where: { ...accounts, createdAt } }),
        tx.serviceJob.count({ where: { workspace: live, createdAt } }),
        tx.workspace.count({ where: { ...live, createdAt } }),
        tx.customer.count({ where: { workspace: live, archivedAt: null } }),
        tx.followUp.count({ where: { workspace: live } }),
        tx.followUp.count({
          where: {
            workspace: live,
            dueAt: { lt: to },
            status: { in: ["open", "scheduled", "missed"] },
          },
        }),
        tx.$queryRaw<{ date: string; count: number }[]>`
        SELECT to_char(u."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
          count(*)::int AS count FROM "User" u
        WHERE u."createdAt" >= ${from} AND u."createdAt" <= ${to}
          AND (NOT EXISTS (SELECT 1 FROM "Membership" m WHERE m."userId" = u.id)
            OR EXISTS (SELECT 1 FROM "Membership" m JOIN "Workspace" w
              ON w.id = m."workspaceId" WHERE m."userId" = u.id
              AND w."dataClassification" = 'normal' AND w."qaPurgeStartedAt" IS NULL
              AND NOT (w.id = ANY(${excludedWorkspaceIds}::text[]))))
        GROUP BY 1`,
        tx.$queryRaw<{ date: string; count: number }[]>`
        SELECT to_char(j."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
          count(*)::int AS count FROM "ServiceJob" j JOIN "Workspace" w
          ON w.id = j."workspaceId"
        WHERE j."createdAt" >= ${from} AND j."createdAt" <= ${to}
          AND w."dataClassification" = 'normal' AND w."qaPurgeStartedAt" IS NULL
          AND NOT (w.id = ANY(${excludedWorkspaceIds}::text[]))
        GROUP BY 1`,
      ]);
      const userCounts = new Map(userDays.map((row) => [row.date, row.count]));
      const jobCounts = new Map(jobDays.map((row) => [row.date, row.count]));
      return {
        version: 1 as const,
        projectId: "afterservice" as const,
        asOf: to.toISOString(),
        period: { from: from.toISOString(), to: to.toISOString() },
        capabilities: { businessStatus: false, campaigns: false },
        totals: {
          businesses,
          activeBusinesses: businesses,
          users,
          newUsers,
          orders,
          newBusinesses,
          customers,
          followUps,
          overdueFollowUps,
        },
        series: Array.from({ length: days }, (_, offset) => {
          const date = new Date(from.getTime() + offset * 86400000)
            .toISOString()
            .slice(0, 10);
          return {
            date,
            users: userCounts.get(date) ?? 0,
            orders: jobCounts.get(date) ?? 0,
          };
        }),
      };
    },
    { isolationLevel: "RepeatableRead", timeout: 15000 },
  );
}

export async function getOversightBusinesses(
  db: PrismaClient,
  input: OversightDirectoryInput,
) {
  const { live } = reportingPopulation();
  const rows = await db.workspace.findMany({
    where: {
      ...live,
      ...(input.cursor ? { id: { gt: input.cursor } } : {}),
      ...(input.search
        ? {
            OR: [
              {
                name: { contains: input.search, mode: "insensitive" as const },
              },
              {
                slug: { contains: input.search, mode: "insensitive" as const },
              },
            ],
          }
        : {}),
    },
    orderBy: { id: "asc" },
    take: 51,
    select: {
      id: true,
      name: true,
      slug: true,
      businessType: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { memberships: true, jobs: true } },
    },
  });
  return page(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      type: row.businessType ?? "Unspecified",
      status: "active" as const,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      users: row._count.memberships,
      orders: row._count.jobs,
    })),
  );
}

export async function getOversightUsers(
  db: PrismaClient,
  input: OversightDirectoryInput,
) {
  const { accounts, live } = reportingPopulation();
  const rows = await db.user.findMany({
    where: {
      AND: [
        accounts,
        ...(input.cursor ? [{ id: { gt: input.cursor } }] : []),
        ...(input.search
          ? [
              {
                OR: [
                  {
                    name: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: { id: "asc" },
    take: 51,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: { select: { memberships: { where: { workspace: live } } } },
    },
  });
  return page(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
      businesses: row._count.memberships,
    })),
  );
}

export async function getOversightRecords(
  db: PrismaClient,
  input: OversightDirectoryInput,
) {
  const { live } = reportingPopulation();
  const rows = await db.serviceJob.findMany({
    where: {
      workspace: live,
      ...(input.cursor ? { id: { gt: input.cursor } } : {}),
      ...(input.search
        ? { title: { contains: input.search, mode: "insensitive" as const } }
        : {}),
    },
    orderBy: { id: "asc" },
    take: 51,
    select: {
      id: true,
      title: true,
      status: true,
      amountCents: true,
      createdAt: true,
      workspace: { select: { name: true } },
    },
  });
  return page(
    rows.map((row) => ({
      id: row.id,
      number: row.title,
      business: row.workspace.name,
      status: row.status,
      // Job amounts have no stored currency. Never invent a currency or a zero value.
      currency: null,
      totalMinor: row.amountCents,
      createdAt: row.createdAt.toISOString(),
    })),
  );
}
