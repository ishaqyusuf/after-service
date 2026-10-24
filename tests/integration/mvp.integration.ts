import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";
import { createHmac, randomUUID } from "node:crypto";
import { tasks } from "@trigger.dev/sdk/v3";
import type { ApiContext } from "../../apps/api/src/context";
import { localTestDb } from "../support/local-db";

const db = localTestDb();
// These tests never enable paid checkout, analytics, or customer delivery.
process.env.AFTERSERVICE_PAID_CHECKOUT_ENABLED = "false";
process.env.LOGLY_ENABLED = "false";
process.env.LEMON_SQUEEZY_WEBHOOK_SECRET = "integration-webhook-secret";
process.env.LEMON_SQUEEZY_GROWTH_VARIANT_ID = "integration-growth";
process.env.CRON_SECRET = "integration-cron-secret";
const { appRouter } = await import("../../apps/api/src/routers/_app");
const { default: app } = await import("../../apps/api/src/index");
const workspaceIds: string[] = [];
const userIds: string[] = [];

async function workspace(role: "owner" | "admin" | "staff" = "owner") {
  const id = randomUUID();
  const user = await db.user.create({
    data: { email: `${id}@afterservice.invalid`, name: "Integration Operator" },
  });
  userIds.push(user.id);
  const item = await db.workspace.create({
    data: { name: "Integration Workshop", slug: `integration-${id}` },
  });
  workspaceIds.push(item.id);
  const member = await db.membership.create({
    data: { userId: user.id, workspaceId: item.id, role },
  });
  const ctx: ApiContext = {
    requestId: id,
    session: null,
    user: { ...user },
    platformRole: "user",
    workspace: { id: item.id, slug: item.slug, role },
  };
  const customer = await db.customer.create({
    data: { name: "Integration Customer", workspaceId: item.id },
  });
  const job = await db.serviceJob.create({
    data: {
      title: "Integration Repair",
      completedAt: new Date(),
      customerId: customer.id,
      workspaceId: item.id,
    },
  });
  const template = await db.followUpTemplate.create({
    data: {
      name: "Integration Check-in",
      body: "Hi {{customer_name}}",
      channel: "phone",
      workspaceId: item.id,
    },
  });
  const followUp = await db.followUp.create({
    data: {
      customerId: customer.id,
      jobId: job.id,
      templateId: template.id,
      channel: "phone",
      dueAt: new Date(),
      status: "scheduled",
      workspaceId: item.id,
    },
  });
  return {
    caller: appRouter.createCaller(ctx),
    ctx,
    user,
    member,
    item,
    customer,
    job,
    template,
    followUp,
  };
}

let own: Awaited<ReturnType<typeof workspace>>;
let other: Awaited<ReturnType<typeof workspace>>;
beforeEach(async () => {
  own = await workspace();
  other = await workspace();
});
afterEach(async () => {
  for (const id of workspaceIds.splice(0))
    await db.workspace.delete({ where: { id } });
  for (const id of userIds.splice(0)) await db.user.delete({ where: { id } });
});
afterAll(() => db.$disconnect());

describe("workspace isolation", () => {
  test("lists exclude another workspace's customers, jobs, follow-ups and templates", async () => {
    expect((await own.caller.customers.list()).items.map((x) => x.id)).toEqual([
      own.customer.id,
    ]);
    expect(
      (await own.caller.serviceJobs.list()).items.map((x) => x.id),
    ).toEqual([own.job.id]);
    expect(
      (await own.caller.followUps.listTable()).items.map((x) => x.id),
    ).toEqual([own.followUp.id]);
    expect((await own.caller.templates.list()).items.map((x) => x.id)).toEqual([
      own.template.id,
    ]);
  });
  for (const domain of [
    "customers",
    "serviceJobs",
    "followUps",
    "templates",
  ] as const) {
    test(`${domain} rejects foreign record reads`, async () => {
      const id = {
        customers: other.customer.id,
        serviceJobs: other.job.id,
        followUps: other.followUp.id,
        templates: other.template.id,
      }[domain];
      await expect(own.caller[domain].get({ id })).rejects.toBeDefined();
    });
  }
  test("foreign customer update/archive cannot mutate the record", async () => {
    await expect(
      own.caller.customers.update({ id: other.customer.id, name: "Intrusion" }),
    ).rejects.toBeDefined();
    await expect(
      own.caller.customers.archive({ id: other.customer.id }),
    ).rejects.toBeDefined();
    const record = await db.customer.findUniqueOrThrow({
      where: { id: other.customer.id },
    });
    expect(record.name).toBe(other.customer.name);
    expect(record.archivedAt).toBeNull();
  });
  test("foreign follow-up transitions cannot write events or status", async () => {
    await expect(
      own.caller.followUps.close({ id: other.followUp.id }),
    ).rejects.toBeDefined();
    await expect(
      own.caller.followUps.markReplied({ id: other.followUp.id }),
    ).rejects.toBeDefined();
    await expect(
      own.caller.followUps.reschedule({
        id: other.followUp.id,
        dueAt: new Date(),
      }),
    ).rejects.toBeDefined();
    expect(
      await db.followUpEvent.count({
        where: { followUpId: other.followUp.id },
      }),
    ).toBe(0);
    expect(
      (
        await db.followUp.findUniqueOrThrow({
          where: { id: other.followUp.id },
        })
      ).status,
    ).toBe("scheduled");
  });
  test("job creation rejects a foreign customer", async () => {
    await expect(
      own.caller.serviceJobs.create({
        title: "Intrusion",
        completedAt: new Date(),
        customerId: other.customer.id,
      }),
    ).rejects.toBeDefined();
    expect(
      await db.serviceJob.count({ where: { workspaceId: own.item.id } }),
    ).toBe(1);
  });
  test("follow-up creation rejects a foreign job before writing", async () => {
    await expect(
      own.caller.followUps.create({
        customerId: own.customer.id,
        jobId: other.job.id,
        channel: "phone",
        dueAt: new Date(),
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(
      await db.followUp.count({ where: { workspaceId: own.item.id } }),
    ).toBe(1);
  });
  test("follow-up creation rejects a job for a different customer in the same workspace", async () => {
    const customer = await db.customer.create({
      data: { name: "Second Customer", workspaceId: own.item.id },
    });
    await expect(
      own.caller.followUps.create({
        customerId: customer.id,
        jobId: own.job.id,
        channel: "phone",
        dueAt: new Date(),
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  test("follow-up creation rejects a foreign template", async () => {
    await expect(
      own.caller.followUps.create({
        customerId: own.customer.id,
        templateId: other.template.id,
        channel: "phone",
        dueAt: new Date(),
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
  test("scheduling from a job rejects a foreign template without changing the job", async () => {
    await expect(
      own.caller.serviceJobs.createFollowUp({
        jobId: own.job.id,
        templateId: other.template.id,
        channel: "phone",
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(
      (await db.serviceJob.findUniqueOrThrow({ where: { id: own.job.id } }))
        .status,
    ).toBe("completed");
  });
  test("follow-up update rejects a foreign template without changing the draft", async () => {
    await expect(
      own.caller.followUps.update({
        id: own.followUp.id,
        channel: "phone",
        dueAt: new Date(),
        status: "scheduled",
        templateId: other.template.id,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(
      (await db.followUp.findUniqueOrThrow({ where: { id: own.followUp.id } }))
        .templateId,
    ).toBe(own.template.id);
  });
  test("assignment requires a member of the active workspace", async () => {
    await expect(
      own.caller.followUps.assignOwner({
        id: own.followUp.id,
        assigneeId: other.member.id,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const assigned = await own.caller.followUps.assignOwner({
      id: own.followUp.id,
      assigneeId: own.member.id,
    });
    expect(assigned.item.assigneeId).toBe(own.member.id);
    await own.caller.followUps.assignOwner({
      id: own.followUp.id,
      assigneeId: null,
    });
    expect(
      (await db.followUp.findUniqueOrThrow({ where: { id: own.followUp.id } }))
        .assigneeId,
    ).toBeNull();
  });
});

describe("permissions and input validation", () => {
  test("real session context loses workspace access immediately after membership removal", async () => {
    const { createContext } = await import("../../apps/api/src/context");
    const { createBetterAuthSessionCookieHeaders } = await import(
      "../../packages/auth/src/index"
    );
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60_000);
    await db.session.create({
      data: { userId: own.user.id, token, expiresAt },
    });
    const [cookie] = createBetterAuthSessionCookieHeaders(
      { token, expiresAt },
      {
        ...process.env,
        BETTER_AUTH_URL: "http://localhost:4101",
      },
    );
    const request = () =>
      new Request("http://localhost:4101/api/trpc", {
        headers: { cookie: cookie?.split(";")[0] ?? "" },
      });
    expect((await createContext(request())).workspace?.id).toBe(own.item.id);
    await db.membership.delete({ where: { id: own.member.id } });
    const revoked = await createContext(request());
    expect(revoked.user?.id).toBe(own.user.id);
    expect(revoked.workspace).toBeNull();
    await expect(
      appRouter.createCaller(revoked).customers.list(),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  test("expired sessions do not produce an authenticated context", async () => {
    const { createContext } = await import("../../apps/api/src/context");
    const { createBetterAuthSessionCookieHeaders } = await import(
      "../../packages/auth/src/index"
    );
    const token = randomUUID();
    await db.session.create({
      data: {
        userId: own.user.id,
        token,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });
    const [cookie] = createBetterAuthSessionCookieHeaders(
      { token, expiresAt: new Date(Date.now() + 60_000) },
      { ...process.env, BETTER_AUTH_URL: "http://localhost:4101" },
    );
    const context = await createContext(
      new Request("http://localhost:4101/api/trpc", {
        headers: { cookie: cookie?.split(";")[0] ?? "" },
      }),
    );
    expect(context.user).toBeNull();
    expect(context.workspace).toBeNull();
  });
  test("HTTPS Portless origins are exact trusted origins", async () => {
    const { getTrustedOrigins } = await import("../../packages/auth/src/index");
    const origins = getTrustedOrigins();
    expect(origins).toContain("https://app-afterservice.localhost");
    expect(origins).toContain("https://afterservice.localhost");
    expect(origins).not.toContain("https://evil.app-afterservice.localhost");
  });
  test("anonymous and not-yet-onboarded callers fail with distinct auth codes", async () => {
    const anonymous = appRouter.createCaller({
      ...own.ctx,
      user: null,
      workspace: null,
    });
    await expect(anonymous.customers.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    const unbound = appRouter.createCaller({ ...own.ctx, workspace: null });
    await expect(unbound.followUps.listBoard()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
  test("staff cannot update workspace settings, open billing, or purge data", async () => {
    const staff = appRouter.createCaller({
      ...own.ctx,
      workspace: { id: own.item.id, slug: own.item.slug, role: "staff" },
    });
    await expect(
      staff.workspace.updateSettings({
        name: "Changed",
        defaultFollowUpDelayDays: 7,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(staff.billing.createCheckout()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(staff.billing.getPortalUrl()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect((await staff.billing.getCurrentPlan()).item.plan).toBe("starter");
    await expect(own.caller.qaMaintenance.candidates()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
  test("invalid inputs fail before persistence", async () => {
    await expect(
      own.caller.customers.create({ name: "   " }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      own.caller.customers.create({ name: "Valid", email: "invalid" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      own.caller.serviceJobs.create({
        title: "Repair",
        completedAt: new Date(),
        customerId: own.customer.id,
        amountCents: -1,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      own.caller.workspace.updateSettings({
        name: "Workshop",
        defaultFollowUpDelayDays: 366,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      own.caller.followUps.create({
        customerId: own.customer.id,
        dueAt: "invalid",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(
      await db.customer.count({ where: { workspaceId: own.item.id } }),
    ).toBe(1);
  });
  test("checkout without a plan does not change entitlements", async () => {
    await expect(own.caller.billing.createCheckout()).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(
      (await db.workspace.findUniqueOrThrow({ where: { id: own.item.id } }))
        .plan,
    ).toBe("starter");
  });
});

describe("limits and operator state", () => {
  test("email sent state is written only after the queue accepts it", async () => {
    const originalKey = process.env.TRIGGER_SECRET_KEY;
    process.env.TRIGGER_SECRET_KEY = "tr_prod_integration_only";
    const trigger = spyOn(tasks, "trigger").mockImplementation(
      async (taskIdentifier) => {
        const item = await db.followUp.findUniqueOrThrow({
          where: { id: own.followUp.id },
        });
        expect(item.status).toBe("scheduled");
        expect(item.sentAt).toBeNull();
        // Trigger's handle has type-only brands absent from its wire response.
        return {
          id: "run_integration",
          publicAccessToken: "integration-only",
          taskIdentifier,
        } as unknown as Awaited<ReturnType<typeof tasks.trigger>>;
      },
    );
    await db.followUp.update({
      where: { id: own.followUp.id },
      data: { channel: "email" },
    });
    try {
      const result = await own.caller.followUps.markSent({
        id: own.followUp.id,
        recipient: "customer@afterservice.invalid",
        body: "No real provider is called.",
      });
      expect(result.item.status).toBe("sent");
      expect(result.item.sentAt).not.toBeNull();
      expect(trigger).toHaveBeenCalledTimes(1);
    } finally {
      trigger.mockRestore();
      if (originalKey) process.env.TRIGGER_SECRET_KEY = originalKey;
      else delete process.env.TRIGGER_SECRET_KEY;
    }
  });

  test("queue rejection leaves email scheduled without sent state or audit writes", async () => {
    const originalKey = process.env.TRIGGER_SECRET_KEY;
    process.env.TRIGGER_SECRET_KEY = "tr_prod_integration_only";
    const trigger = spyOn(tasks, "trigger").mockRejectedValue(
      new Error(
        "You can't trigger a task because you have run out of credits.",
      ),
    );
    await db.followUp.update({
      where: { id: own.followUp.id },
      data: { channel: "email" },
    });
    try {
      await expect(
        own.caller.followUps.markSent({
          id: own.followUp.id,
          recipient: "customer@afterservice.invalid",
          body: "No real provider is called.",
        }),
      ).rejects.toMatchObject({ code: "BAD_GATEWAY" });
      expect(trigger).toHaveBeenCalledTimes(1);
      const item = await db.followUp.findUniqueOrThrow({
        where: { id: own.followUp.id },
        include: { messageLogs: true, events: true },
      });
      expect(item.status).toBe("scheduled");
      expect(item.sentAt).toBeNull();
      expect(item.messageLogs).toHaveLength(0);
      expect(item.events).toHaveLength(0);
    } finally {
      trigger.mockRestore();
      if (originalKey) process.env.TRIGGER_SECRET_KEY = originalKey;
      else delete process.env.TRIGGER_SECRET_KEY;
    }
  });

  test("unconfigured production email fails before sent state or audit writes", async () => {
    const originalKey = process.env.TRIGGER_SECRET_KEY;
    const originalMode = process.env.AFTERSERVICE_ENV_MODE;
    await db.followUp.update({
      where: { id: own.followUp.id },
      data: { channel: "email" },
    });
    try {
      process.env.AFTERSERVICE_ENV_MODE = "production";
      for (const key of [undefined, "tr_dev_integration_only"]) {
        if (key) process.env.TRIGGER_SECRET_KEY = key;
        else delete process.env.TRIGGER_SECRET_KEY;
        await expect(
          own.caller.followUps.markSent({
            id: own.followUp.id,
            recipient: "customer@afterservice.invalid",
            body: "Do not dispatch this test.",
          }),
        ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
        const item = await db.followUp.findUniqueOrThrow({
          where: { id: own.followUp.id },
          include: { messageLogs: true, events: true },
        });
        expect(item.status).toBe("scheduled");
        expect(item.sentAt).toBeNull();
        expect(item.messageLogs).toHaveLength(0);
        expect(item.events).toHaveLength(0);
      }
    } finally {
      if (originalKey) process.env.TRIGGER_SECRET_KEY = originalKey;
      else delete process.env.TRIGGER_SECRET_KEY;
      process.env.AFTERSERVICE_ENV_MODE = originalMode;
    }
  });

  test("customer cap accepts the last slot, rejects overflow, and archive frees a slot", async () => {
    await db.customer.createMany({
      data: Array.from({ length: 98 }, (_, n) => ({
        name: `Customer ${n}`,
        workspaceId: own.item.id,
      })),
    });
    await own.caller.customers.create({ name: "Last Slot" });
    await expect(
      own.caller.customers.create({ name: "Overflow" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await own.caller.customers.archive({ id: own.customer.id });
    expect(
      (await own.caller.customers.create({ name: "Replacement" })).item.name,
    ).toBe("Replacement");
    expect(
      (await own.caller.customers.list({ search: "Integration Customer" }))
        .items,
    ).toHaveLength(0);
    expect(
      (
        await own.caller.customers.list({
          search: "Integration Customer",
          includeArchived: true,
        })
      ).items,
    ).toHaveLength(1);
  });
  test("template cap and default selection stay within workspace and channel", async () => {
    await db.followUpTemplate.update({
      where: { id: other.template.id },
      data: { isDefault: true },
    });
    const previous = await db.followUpTemplate.create({
      data: {
        workspaceId: own.item.id,
        name: "Previous phone default",
        channel: "phone",
        body: "Hello",
        isDefault: true,
      },
    });
    await db.followUpTemplate.createMany({
      data: Array.from({ length: 3 }, (_, n) => ({
        name: `Template ${n}`,
        body: "Hi",
        channel: "email" as const,
        workspaceId: own.item.id,
      })),
    });
    await expect(
      own.caller.templates.create({ name: "Overflow", body: "Hi" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await own.caller.templates.setDefault({ id: own.template.id });
    expect(
      (
        await db.followUpTemplate.findUniqueOrThrow({
          where: { id: other.template.id },
        })
      ).isDefault,
    ).toBe(true);
    expect(
      (
        await db.followUpTemplate.findUniqueOrThrow({
          where: { id: previous.id },
        })
      ).isDefault,
    ).toBe(false);
  });
  test("follow-up cap applies to both creation entrypoints", async () => {
    await db.followUp.createMany({
      data: Array.from({ length: 199 }, () => ({
        customerId: own.customer.id,
        dueAt: new Date(),
        workspaceId: own.item.id,
      })),
    });
    await expect(
      own.caller.followUps.create({
        customerId: own.customer.id,
        channel: "phone",
        dueAt: new Date(),
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      own.caller.serviceJobs.createFollowUp({
        jobId: own.job.id,
        channel: "phone",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  test("scheduling uses workspace cadence and writes matching job/event state", async () => {
    await db.workspace.update({
      where: { id: own.item.id },
      data: { defaultFollowUpDelayDays: 14 },
    });
    const start = Date.now();
    const result = await own.caller.serviceJobs.createFollowUp({
      jobId: own.job.id,
      channel: "phone",
      templateId: own.template.id,
    });
    expect(new Date(result.item.dueAt).getTime()).toBeGreaterThanOrEqual(
      start + 14 * 86400000,
    );
    const job = await db.serviceJob.findUniqueOrThrow({
      where: { id: own.job.id },
    });
    expect(job.status).toBe("needs_follow_up");
    expect(job.nextFollowUpAt?.toISOString()).toBe(result.item.dueAt);
    expect(
      await db.followUpEvent.count({
        where: {
          followUpId: result.item.id,
          type: "created_from_job",
          workspaceId: own.item.id,
        },
      }),
    ).toBe(1);
  });
  test("calendar queries validate timezone and keep overdue sent work only in Waiting", async () => {
    await db.followUp.update({
      where: { id: own.followUp.id },
      data: { status: "sent", dueAt: new Date("2010-01-01T00:00:00Z") },
    });
    const board = await own.caller.followUps.listBoard({
      timeZone: "Africa/Lagos",
    });
    expect(
      board.columns.waiting.some((item) => item.id === own.followUp.id),
    ).toBe(true);
    expect(
      Object.values(board.columns)
        .flat()
        .filter((item) => item.id === own.followUp.id),
    ).toHaveLength(1);
    const overview = await own.caller.dashboard.overview({
      timeZone: "Africa/Lagos",
    });
    expect(overview.counts.overdueFollowUps).toBe(0);
    await expect(
      own.caller.followUps.listBoard({ timeZone: "invalid/timezone" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      own.caller.dashboard.overview({ timeZone: "invalid/timezone" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
  test("manual phone logging, replies, closure, and rescheduling persist audit events", async () => {
    await own.caller.followUps.markSent({
      id: own.followUp.id,
      recipient: "manual",
      body: "Called customer",
      subject: "Service check-in",
    });
    expect(
      await db.messageLog.count({
        where: { followUpId: own.followUp.id, workspaceId: own.item.id },
      }),
    ).toBe(1);
    await own.caller.followUps.markReplied({
      id: own.followUp.id,
      notes: "All good",
    });
    await own.caller.followUps.close({
      id: own.followUp.id,
      notes: "Resolved",
    });
    const closed = await db.followUp.findUniqueOrThrow({
      where: { id: own.followUp.id },
    });
    expect(closed.status).toBe("closed");
    expect(
      await db.followUpEvent.count({
        where: { followUpId: own.followUp.id, type: "replied" },
      }),
    ).toBe(1);
    expect(closed.closedAt).not.toBeNull();
    await own.caller.followUps.reschedule({
      id: own.followUp.id,
      dueAt: new Date(Date.now() + 86400000),
    });
    const board = await own.caller.followUps.listBoard();
    expect(board.columns.upcoming.some((x) => x.id === own.followUp.id)).toBe(
      true,
    );
    expect(board.columns.closed.some((x) => x.id === own.followUp.id)).toBe(
      false,
    );
  });
});

describe("webhook and cron boundaries", () => {
  test("missed-state processing is scoped, repeatable, and preserves contacted or future work", async () => {
    const now = new Date("2010-01-02T00:00:00.000Z");
    await db.followUp.update({
      where: { id: own.followUp.id },
      data: { dueAt: new Date("2010-01-01T00:00:00.000Z"), status: "open" },
    });
    const preserved = await Promise.all(
      (["sent", "replied", "closed", "missed", "scheduled"] as const).map(
        (status) =>
          db.followUp.create({
            data: {
              workspaceId: own.item.id,
              customerId: own.customer.id,
              channel: "phone",
              status,
              dueAt:
                status === "scheduled"
                  ? now
                  : new Date("2010-01-01T00:00:00.000Z"),
            },
          }),
      ),
    );
    const headers = { authorization: "Bearer integration-cron-secret" };
    const invoke = () =>
      app.request("/api/jobs/follow-ups/dry-run", {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspaceId: own.item.id,
          now: now.toISOString(),
          markMissed: true,
        }),
      });
    const first = await invoke();
    expect(first.status).toBe(200);
    expect((await first.json()).result.missed).toBe(1);
    expect(
      (await db.followUp.findUniqueOrThrow({ where: { id: own.followUp.id } }))
        .status,
    ).toBe("missed");
    expect((await (await invoke()).json()).result.missed).toBe(0);
    for (const item of preserved) {
      expect(
        (await db.followUp.findUniqueOrThrow({ where: { id: item.id } }))
          .status,
      ).toBe(item.status);
    }
    expect(
      (
        await db.followUp.findUniqueOrThrow({
          where: { id: other.followUp.id },
        })
      ).status,
    ).toBe("scheduled");
    expect(
      await db.messageLog.count({ where: { workspaceId: own.item.id } }),
    ).toBe(0);
  });

  function signedRequest(body: string) {
    return new Request("http://api.afterservice.test/webhooks/lemon-squeezy", {
      method: "POST",
      body,
      headers: {
        "x-signature": createHmac("sha256", "integration-webhook-secret")
          .update(body)
          .digest("hex"),
      },
    });
  }
  test("signed malformed webhook JSON is a client error", async () => {
    expect((await app.fetch(signedRequest("{"))).status).toBe(400);
    expect((await app.fetch(signedRequest("null"))).status).toBe(400);
    expect((await app.fetch(signedRequest("[]"))).status).toBe(400);
  });
  test("authorized malformed cron JSON is a client error", async () => {
    const response = await app.fetch(
      new Request("http://api.afterservice.test/api/jobs/follow-ups/dry-run", {
        method: "POST",
        headers: { "x-cron-secret": "integration-cron-secret" },
        body: "{",
      }),
    );
    expect(response.status).toBe(400);
  });
  test("tampered webhook is rejected with no billing writes", async () => {
    const request = signedRequest("{}");
    const response = await app.fetch(
      new Request(request.url, {
        method: "POST",
        headers: request.headers,
        body: '{"tampered":true}',
      }),
    );
    expect(response.status).toBe(401);
    expect(
      await db.billingEvent.count({ where: { workspaceId: own.item.id } }),
    ).toBe(0);
  });
  test("subscription events update entitlements once and cancellation is persisted", async () => {
    const subscriptionId = `subscription-${randomUUID()}`;
    const payload = (event: string, status: string) =>
      JSON.stringify({
        meta: {
          event_id: `${subscriptionId}-${event}`,
          event_name: event,
          custom_data: { workspace_id: own.item.id },
        },
        data: {
          id: subscriptionId,
          attributes: { status, variant_id: "integration-growth" },
        },
      });
    const created = payload("subscription_created", "active");
    expect((await app.fetch(signedRequest(created))).status).toBe(200);
    expect(
      await (await app.fetch(signedRequest(created))).json(),
    ).toMatchObject({ duplicate: true });
    expect((await own.caller.billing.getCurrentPlan()).item).toMatchObject({
      plan: "growth",
      planStatus: "active",
    });
    expect(
      (
        await app.fetch(
          signedRequest(payload("subscription_cancelled", "cancelled")),
        )
      ).status,
    ).toBe(200);
    expect((await own.caller.billing.getCurrentPlan()).item.planStatus).toBe(
      "canceled",
    );
    expect(
      await db.subscription.count({ where: { workspaceId: own.item.id } }),
    ).toBe(1);
  });
  test("cron rejects bad credentials and invalid dates; dry-run leaves states unchanged", async () => {
    const url = "http://api.afterservice.test/api/jobs/follow-ups/dry-run";
    expect(
      (
        await app.fetch(
          new Request(url, {
            method: "POST",
            headers: { authorization: "Bearer wrong" },
          }),
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await app.fetch(
          new Request(url, {
            method: "POST",
            headers: { "x-cron-secret": "integration-cron-secret" },
            body: '{"now":"invalid"}',
          }),
        )
      ).status,
    ).toBe(400);
    const response = await app.fetch(
      new Request(url, {
        method: "POST",
        headers: { "x-cron-secret": "integration-cron-secret" },
        body: JSON.stringify({
          workspaceId: own.item.id,
          now: new Date(Date.now() + 86400000).toISOString(),
        }),
      }),
    );
    expect(response.status).toBe(200);
    expect(
      (await db.followUp.findUniqueOrThrow({ where: { id: own.followUp.id } }))
        .status,
    ).toBe("scheduled");
  });
});
