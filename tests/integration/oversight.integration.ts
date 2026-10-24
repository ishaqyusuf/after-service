import { expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import app from "../../apps/api/src/rest/routers/oversight";
import { getOversightDbClient } from "../../packages/db/src/oversight-client";
import {
  getOversightBusinesses,
  getOversightRecords,
  getOversightSummary,
  getOversightUsers,
} from "../../packages/db/src/queries/oversight";
import { localTestDb } from "../support/local-db";

const db = localTestDb();

test("reviewed internal exclusions affect every directory and summary without making data purgeable", async () => {
  const marker = `internal-reporting-${randomUUID()}`;
  const original = process.env.ADOPTION_EXCLUDED_WORKSPACE_IDS;
  const now = new Date("2038-04-03T12:00:00Z");
  const operator = await db.user.create({
    data: {
      name: marker,
      email: `${marker}@afterservice.invalid`,
      createdAt: now,
    },
  });
  let workspaceId: string | undefined;
  try {
    const workspace = await db.workspace.create({
      data: {
        name: marker,
        slug: marker,
        createdAt: now,
        memberships: { create: { role: "owner", userId: operator.id } },
        customers: { create: { name: marker } },
      },
    });
    workspaceId = workspace.id;
    const customer = await db.customer.findFirstOrThrow({
      where: { workspaceId: workspace.id },
    });
    await db.serviceJob.create({
      data: {
        workspaceId: workspace.id,
        customerId: customer.id,
        title: marker,
        createdAt: now,
        completedAt: now,
      },
    });
    const before = await getOversightSummary(db, 7, now);
    process.env.ADOPTION_EXCLUDED_WORKSPACE_IDS = [original, workspace.id]
      .filter(Boolean)
      .join(",");
    const after = await getOversightSummary(db, 7, now);
    expect(after.totals.businesses).toBe(before.totals.businesses - 1);
    expect(after.totals.users).toBe(before.totals.users - 1);
    expect(after.totals.customers).toBe(before.totals.customers - 1);
    expect(after.totals.orders).toBe(before.totals.orders - 1);
    expect(after.series.at(-1)?.users).toBe(0);
    expect(after.series.at(-1)?.orders).toBe(0);
    expect(
      (await getOversightBusinesses(db, { search: marker })).items,
    ).toHaveLength(0);
    expect(
      (await getOversightUsers(db, { search: marker })).items,
    ).toHaveLength(0);
    expect(
      (await getOversightRecords(db, { search: marker })).items,
    ).toHaveLength(0);
    expect(
      (await getOversightBusinesses(db, { search: marker, cursor: "a" })).items,
    ).toHaveLength(0);
    expect(
      (await getOversightRecords(db, { search: marker, cursor: "a" })).items,
    ).toHaveLength(0);
    const retained = await db.workspace.findUniqueOrThrow({
      where: { id: workspace.id },
      select: {
        dataClassification: true,
        qaMarkedAt: true,
        qaPurgeStartedAt: true,
      },
    });
    expect(retained).toEqual({
      dataClassification: "normal",
      qaMarkedAt: null,
      qaPurgeStartedAt: null,
    });
  } finally {
    if (original === undefined)
      delete process.env.ADOPTION_EXCLUDED_WORKSPACE_IDS;
    else process.env.ADOPTION_EXCLUDED_WORKSPACE_IDS = original;
    if (workspaceId) await db.workspace.delete({ where: { id: workspaceId } });
    await db.user.delete({ where: { id: operator.id } });
  }
});

test("authenticated HTTP reads use the separate read-only client and reject writes", async () => {
  const original = {
    OVERSIGHT_ENABLED: process.env.OVERSIGHT_ENABLED,
    OVERSIGHT_READ_KEY: process.env.OVERSIGHT_READ_KEY,
    OVERSIGHT_DATABASE_URL: process.env.OVERSIGHT_DATABASE_URL,
  };
  const key = "local-integration-oversight-read-key";
  process.env.OVERSIGHT_ENABLED = "true";
  process.env.OVERSIGHT_READ_KEY = key;
  process.env.OVERSIGHT_DATABASE_URL = process.env.DATABASE_URL;
  const headers = { authorization: `Bearer ${key}` };
  try {
    for (const path of [
      "/summary?days=7",
      "/businesses",
      "/users",
      "/records",
    ]) {
      const response = await app.request(path, { headers });
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const payload = await response.json();
      if (path.startsWith("/summary"))
        expect(payload.projectId).toBe("afterservice");
      else expect(Array.isArray(payload.items)).toBe(true);
      expect(
        (await app.request(path, { method: "POST", headers })).status,
      ).toBe(404);
    }
    await expect(
      Promise.resolve(
        getOversightDbClient()
          .$executeRaw`UPDATE "Workspace" SET name = name WHERE FALSE`,
      ),
    ).rejects.toThrow("read-only transaction");
  } finally {
    await getOversightDbClient().$disconnect();
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("Oversight reads live workspaces, excludes QA/purging data, paginates, and preserves unknown values", async () => {
  const marker = `oversight-${randomUUID()}`;
  const now = new Date("2035-01-07T12:00:00Z");
  const workspaceIds: string[] = [];
  const userIds: string[] = [];
  const before = await getOversightSummary(db, 7, now);
  try {
    const operator = await db.user.create({
      data: {
        name: marker,
        email: `${marker}@afterservice.invalid`,
        createdAt: now,
      },
    });
    const qaOperator = await db.user.create({
      data: {
        name: `${marker}-qa`,
        email: `${marker}-qa@afterservice.invalid`,
        createdAt: now,
      },
    });
    userIds.push(operator.id, qaOperator.id);
    for (const lane of ["live", "qa", "purging"] as const) {
      const workspace = await db.workspace.create({
        data: {
          name: `${marker}-${lane}`,
          slug: `${marker}-${lane}`,
          createdAt: now,
          dataClassification: lane === "qa" ? "qa" : "normal",
          qaPurgeStartedAt: lane === "purging" ? now : null,
        },
      });
      workspaceIds.push(workspace.id);
      await db.membership.create({
        data: {
          workspaceId: workspace.id,
          userId: lane === "live" ? operator.id : qaOperator.id,
          role: "owner",
        },
      });
      const customer = await db.customer.create({
        data: { name: marker, workspaceId: workspace.id },
      });
      await db.serviceJob.createMany({
        data: Array.from({ length: lane === "live" ? 51 : 1 }, (_, index) => ({
          workspaceId: workspace.id,
          customerId: customer.id,
          title: `${marker}-${index}`,
          completedAt: now,
          createdAt: now,
          amountCents: index === 0 ? null : 12345,
        })),
      });
      await db.followUp.create({
        data: {
          workspaceId: workspace.id,
          customerId: customer.id,
          dueAt: new Date(now.getTime() - 1),
          status: "scheduled",
        },
      });
    }
    const businesses = await getOversightBusinesses(db, { search: marker });
    const liveWorkspaceId = workspaceIds[0];
    if (!liveWorkspaceId)
      throw new Error("Expected the live workspace fixture");
    expect(businesses.items.map((row) => row.id)).toEqual([liveWorkspaceId]);
    expect(businesses.items[0]?.orders).toBe(51);
    expect(businesses.items[0]?.users).toBe(1);
    expect(
      (await getOversightUsers(db, { search: marker })).items.map(
        (row) => row.id,
      ),
    ).toEqual([operator.id]);
    const first = await getOversightRecords(db, { search: marker });
    expect(first.items).toHaveLength(50);
    expect(first.nextCursor).not.toBeNull();
    if (!first.nextCursor) throw new Error("Expected a second page");
    const second = await getOversightRecords(db, {
      search: marker,
      cursor: first.nextCursor,
    });
    expect(second.items).toHaveLength(1);
    expect(second.nextCursor).toBeNull();
    expect(
      new Set([...first.items, ...second.items].map((row) => row.id)).size,
    ).toBe(51);
    expect(
      [...first.items, ...second.items].every((row) => row.currency === null),
    ).toBe(true);
    expect(
      [...first.items, ...second.items].some((row) => row.totalMinor === null),
    ).toBe(true);
    for (const days of [7, 30, 90] as const) {
      const summary = await getOversightSummary(db, days, now);
      expect(summary.projectId).toBe("afterservice");
      expect(summary.capabilities).toEqual({
        businessStatus: false,
        campaigns: false,
      });
      expect(summary.series).toHaveLength(days);
      expect(summary.series.at(-1)).toEqual({
        date: "2035-01-07",
        users: 1,
        orders: 51,
      });
      expect(summary.totals.businesses).toBe(before.totals.businesses + 1);
      expect(summary.totals.customers).toBe(before.totals.customers + 1);
      expect(summary.totals.followUps).toBe(before.totals.followUps + 1);
      expect(summary.totals.overdueFollowUps).toBe(
        before.totals.overdueFollowUps + 1,
      );
      expect(summary.totals.newUsers).toBe(1);
      expect(summary.totals.orders).toBe(51);
    }
  } finally {
    await db.workspace.deleteMany({ where: { id: { in: workspaceIds } } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
  }
});
