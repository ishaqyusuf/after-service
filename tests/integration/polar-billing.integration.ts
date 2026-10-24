import { afterAll, afterEach, beforeEach, expect, test } from "bun:test";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { syncPolarSubscription } from "../../apps/api/src/utils/polar-subscription";
import { localTestDb } from "../support/local-db";

const db = localTestDb();
const originalEnv = { ...process.env };
const productId = "00000000-0000-4000-8000-000000000001";
const organizationId = "00000000-0000-4000-8000-000000000002";
const webhookKey = randomBytes(32);
let workspaceId = "";
let userId = "";
let subscriptionId = "";
const now = new Date();
const periodEnd = new Date(now.getTime() + 30 * 86400_000).toISOString();

beforeEach(async () => {
  const id = randomUUID();
  const user = await db.user.create({
    data: { name: "Polar fixture", email: `polar-${id}@afterservice.invalid` },
  });
  const workspace = await db.workspace.create({
    data: {
      name: "Polar fixture",
      slug: `polar-${id}`,
      memberships: { create: { userId: user.id, role: "owner" } },
    },
  });
  workspaceId = workspace.id;
  userId = user.id;
  subscriptionId = randomUUID();
  Object.assign(process.env, {
    POLAR_ENVIRONMENT: "sandbox",
    POLAR_SANDBOX_ACCESS_TOKEN: "fixture-only",
    POLAR_SANDBOX_ORGANIZATION_ID: organizationId,
    POLAR_SANDBOX_BUSINESS_MONTHLY_PRODUCT_ID: productId,
    POLAR_SANDBOX_WEBHOOK_SECRET: `whsec_${webhookKey.toString("base64")}`,
  });
});
afterEach(async () => {
  await db.billingEvent.deleteMany({ where: { workspaceId } });
  await db.workspace.delete({ where: { id: workspaceId } });
  await db.user.delete({ where: { id: userId } });
  process.env = { ...originalEnv };
});
afterAll(async () => {
  await db.$disconnect();
});

function snapshot(status = "active", revision = 1) {
  return {
    id: subscriptionId,
    created_at: "2026-01-01T00:00:00Z",
    modified_at: new Date(now.getTime() + revision * 1000).toISOString(),
    status,
    amount: 500000,
    currency: "ngn",
    recurring_interval: "month",
    recurring_interval_count: 1,
    current_period_end: periodEnd,
    cancel_at_period_end: false,
    canceled_at: null as string | null,
    ended_at: null as string | null,
    customer_id: randomUUID(),
    product_id: productId,
    customer: { external_id: workspaceId },
    product: { organization_id: organizationId },
  };
}
function sync(data: ReturnType<typeof snapshot>, eventId = randomUUID()) {
  return syncPolarSubscription(db, {
    snapshot: data,
    eventId,
    eventName: `subscription.${data.status}`,
    organizationId,
    productId,
    environment: "sandbox",
    now,
  });
}

test("concurrent duplicate events activate Business exactly once", async () => {
  const id = randomUUID();
  const data = snapshot();
  const results = await Promise.all([sync(data, id), sync(data, id)]);
  expect(results.some((result) => "duplicate" in result)).toBe(true);
  expect(await db.subscription.count({ where: { workspaceId } })).toBe(1);
  expect(await db.billingEvent.count({ where: { workspaceId } })).toBe(2);
  expect(
    await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } }),
  ).toMatchObject({ plan: "growth", planStatus: "active" });
});
test("scheduled cancellation preserves paid access until period end; revocation removes it", async () => {
  const pending = {
    ...snapshot("canceled"),
    cancel_at_period_end: true,
    canceled_at: now.toISOString(),
  };
  await sync(pending);
  expect(
    (await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })).plan,
  ).toBe("growth");
  await sync({ ...snapshot("unpaid", 2), ended_at: now.toISOString() });
  expect(
    await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } }),
  ).toMatchObject({ plan: "starter", planStatus: "canceled" });
});
test("past-due access and recovery follow provider state", async () => {
  await sync(snapshot());
  await sync(snapshot("past_due", 2));
  expect(
    (await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })).plan,
  ).toBe("starter");
  await sync(snapshot("active", 3));
  expect(
    (await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })).plan,
  ).toBe("growth");
});
test("stale deliveries and equal-revision grants cannot restore revoked access", async () => {
  await sync({ ...snapshot("unpaid", 3), ended_at: now.toISOString() });
  expect(await sync(snapshot("active", 2))).toMatchObject({ stale: true });
  expect(await sync(snapshot("active", 3))).toMatchObject({ stale: true });
  expect(
    (await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })).plan,
  ).toBe("starter");
});
test("expired subscriptions do not grant Business", async () => {
  await sync({
    ...snapshot(),
    current_period_end: new Date(now.getTime() - 1000).toISOString(),
  });
  expect(
    (await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })).plan,
  ).toBe("starter");
});
test("unknown product is ignored and wrong organization/amount fail before writes", async () => {
  expect(await sync({ ...snapshot(), product_id: randomUUID() })).toMatchObject(
    { ignored: true },
  );
  await expect(
    sync({ ...snapshot(), product: { organization_id: randomUUID() } }),
  ).rejects.toThrow();
  await expect(sync({ ...snapshot(), amount: 1 })).rejects.toThrow();
  expect(await db.billingEvent.count({ where: { workspaceId } })).toBe(0);
});
test("another workspace cannot take ownership of an existing subscription", async () => {
  await sync(snapshot());
  const other = await db.workspace.create({
    data: { name: "Other", slug: `other-${randomUUID()}` },
  });
  try {
    await expect(
      sync({ ...snapshot("active", 2), customer: { external_id: other.id } }),
    ).rejects.toThrow("workspace mismatch");
  } finally {
    await db.workspace.delete({ where: { id: other.id } });
  }
});
test("QA workspace payment effects fail closed", async () => {
  await db.workspace.update({
    where: { id: workspaceId },
    data: { dataClassification: "qa", qaSourceDomain: "fixture.test" },
  });
  await expect(sync(snapshot())).rejects.toThrow("QA payment effects");
  expect(await db.subscription.count({ where: { workspaceId } })).toBe(0);
});

function signedRequest(
  body: string,
  timestamp = Math.floor(Date.now() / 1000),
) {
  const id = randomUUID();
  const signature = createHmac("sha256", webhookKey)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");
  return {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "webhook-id": id,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": `v1,${signature}`,
    },
    body,
  };
}
test("real Polar signature validation rejects tampering and expired replay, and acknowledges signed future events", async () => {
  const { app } = await import("../../apps/api/src/index");
  const body = JSON.stringify({
    type: "future.polar_event",
    timestamp: now.toISOString(),
    api_version: "2026-10",
    data: {},
  });
  const signed = signedRequest(body);
  expect(
    (await app.request("/webhooks/polar", { ...signed, body: `${body} ` }))
      .status,
  ).toBe(401);
  expect(
    (
      await app.request(
        "/webhooks/polar",
        signedRequest(body, Math.floor(Date.now() / 1000) - 600),
      )
    ).status,
  ).toBe(401);
  expect((await app.request("/webhooks/polar", signed)).status).toBe(202);
  expect(await db.billingEvent.count({ where: { workspaceId } })).toBe(0);
});
