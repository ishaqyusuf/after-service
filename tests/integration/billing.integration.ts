import { afterAll, afterEach, beforeEach, expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { resolvePricingRegion } from "@afterservice/plans";
import type { ApiContext } from "../../apps/api/src/context";
import { localTestDb } from "../support/local-db";

const db = localTestDb();
const originalEnv = { ...process.env };
delete process.env.POLAR_SANDBOX_ACCESS_TOKEN;
delete process.env.POLAR_ACCESS_TOKEN;
const { appRouter } = await import("../../apps/api/src/routers/_app");
let workspaceId = "";
let userId = "";
let context: ApiContext;
beforeEach(async () => {
  const id = randomUUID();
  const user = await db.user.create({
    data: { email: `billing-${id}@afterservice.invalid`, name: "Billing Test" },
  });
  const workspace = await db.workspace.create({
    data: {
      name: "Billing Test",
      slug: `billing-${id}`,
      memberships: { create: { userId: user.id, role: "owner" } },
    },
  });
  userId = user.id;
  workspaceId = workspace.id;
  context = {
    requestId: id,
    user,
    session: null,
    platformRole: "user",
    workspace: { id: workspace.id, slug: workspace.slug, role: "owner" },
    billing: {
      pricing: resolvePricingRegion({ country: "NG" }),
      customerIpAddress: "203.0.113.9",
    },
  };
});
afterEach(async () => {
  process.env = { ...originalEnv };
  delete process.env.POLAR_SANDBOX_ACCESS_TOKEN;
  delete process.env.POLAR_ACCESS_TOKEN;
  await db.workspace.delete({ where: { id: workspaceId } });
  await db.user.delete({ where: { id: userId } });
});
afterAll(async () => {
  process.env = originalEnv;
  await db.$disconnect();
});

const input = {
  plan: "business",
  interval: "monthly",
  currency: "NGN",
  countryCode: "NG",
  expectedAmountMinor: 500000,
} as const;

test("missing billing configuration makes zero external requests and leaves entitlement state unchanged", async () => {
  const requests = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async () => {
        throw new Error("Unexpected provider call");
      },
      { preconnect: globalThis.fetch.preconnect },
    ),
  );
  try {
    const caller = appRouter.createCaller(context);
    await expect(caller.billing.createCheckout(input)).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
    await expect(caller.billing.createCheckout()).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(requests).not.toHaveBeenCalled();
    expect(
      (await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } }))
        .planStatus,
    ).toBe("trialing");
    expect(await db.subscription.count({ where: { workspaceId } })).toBe(0);
  } finally {
    requests.mockRestore();
  }
});

test("staff cannot open checkout", async () => {
  if (!context.workspace) throw new Error("Missing test workspace");
  context.workspace = { ...context.workspace, role: "staff" };
  await expect(
    appRouter.createCaller(context).billing.createCheckout(input),
  ).rejects.toMatchObject({ code: "FORBIDDEN" });
});

test("stale or manipulated display amounts are rejected before provider access", async () => {
  // A stale display must fail before credentials or a provider request are used.

  const caller = appRouter.createCaller(context);
  for (const change of [
    { expectedAmountMinor: 1 },
    { currency: "GBP" as const },
    { countryCode: "GB" },
  ]) {
    await expect(
      caller.billing.createCheckout({ ...input, ...change }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  }
});

test("Business yearly billing is rejected before provider access", async () => {
  await expect(
    appRouter.createCaller(context).billing.createCheckout({
      ...input,
      plan: "business",
      interval: "yearly",
      expectedAmountMinor: 230950000,
    }),
  ).rejects.toMatchObject({ code: "BAD_REQUEST" });
});

test("synthetic enabled caller uses the real SDK adapter and never grants entitlements", async () => {
  process.env.POLAR_ENVIRONMENT = "sandbox";
  process.env.POLAR_SANDBOX_ACCESS_TOKEN = "isolated-test-only";
  process.env.POLAR_SANDBOX_ORGANIZATION_ID = "test-org";
  process.env.POLAR_SANDBOX_WEBHOOK_SECRET = "test-secret";
  process.env.POLAR_SANDBOX_BUSINESS_MONTHLY_PRODUCT_ID =
    "00000000-0000-4000-8000-000000000001";
  let payload: Record<string, unknown> = {};
  const requests = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (url: Parameters<typeof fetch>[0], options?: RequestInit) => {
        expect(String(url)).toStartWith("https://sandbox-api.polar.sh/");
        if (options?.method === "POST") {
          payload = JSON.parse(String(options.body));
          return Response.json({
            id: "test",
            url: "https://sandbox.polar.sh/checkout/test",
            currency: "ngn",
            amount: 500000,
            total_amount: 500000,
            product_id: process.env.POLAR_SANDBOX_BUSINESS_MONTHLY_PRODUCT_ID,
            customer_billing_address: { country: "NG" },
          });
        }
        return Response.json({
          organization_id: "test-org",
          is_archived: false,
          recurring_interval: "month",
          recurring_interval_count: 1,
        });
      },
      { preconnect: globalThis.fetch.preconnect },
    ),
  );
  try {
    const result = await appRouter
      .createCaller(context)
      .billing.createCheckout(input);
    expect(result.checkoutUrl).toBe("https://sandbox.polar.sh/checkout/test");
    expect(payload).toMatchObject({
      external_customer_id: workspaceId,
      customer_billing_address: { country: "NG" },
      currency: "ngn",
      metadata: { teamId: workspaceId, plan: "business" },
    });
    expect(await db.subscription.count({ where: { workspaceId } })).toBe(0);
  } finally {
    requests.mockRestore();
  }
});

test("verified Business allowance expires and duplicate purchase is blocked", async () => {
  await db.workspace.update({
    where: { id: workspaceId },
    data: { plan: "growth", planStatus: "active" },
  });
  const sub = await db.subscription.create({
    data: {
      workspaceId,
      providerSubId: `fixture-${randomUUID()}`,
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 86400000),
    },
  });
  const caller = appRouter.createCaller(context);
  expect((await caller.billing.getCurrentPlan()).item).toMatchObject({
    hasBusinessAccess: true,
    planDisplayName: "Business",
    limits: { customers: 1000, followUps: 3000, teamMembers: 3, templates: 25 },
  });
  await expect(caller.billing.createCheckout(input)).rejects.toMatchObject({
    code: "CONFLICT",
  });
  await db.subscription.update({
    where: { id: sub.id },
    data: { currentPeriodEnd: new Date(Date.now() - 1000) },
  });
  expect((await caller.billing.getCurrentPlan()).item).toMatchObject({
    hasBusinessAccess: false,
    planDisplayName: "Free",
    limits: { customers: 100, followUps: 200, teamMembers: 1, templates: 5 },
  });
});
