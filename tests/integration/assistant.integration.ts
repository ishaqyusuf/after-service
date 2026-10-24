import { afterEach, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import type { LanguageModelV3StreamPart } from "@ai-sdk/provider";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { assistantChatResponse } from "../../apps/api/src/assistant/chat";
import type { ApiContext } from "../../apps/api/src/context";
import type { AssistantAction } from "../../packages/assistant/src";
import {
  admitAssistantRun,
  assistantAllowance,
  confirmAssistantProposal,
  finishAssistantRun,
  readAssistantWorkspace,
} from "../../packages/db/src";
import { localTestDb } from "../support/local-db";

process.env.AFTERSERVICE_ASSISTANT_ENABLED = "true";
process.env.LOGLY_ENABLED = "false";
const db = localTestDb();
const { appRouter, domainRouter } = await import(
  "../../apps/api/src/routers/_app"
);
const users: string[] = [];
const workspaces: string[] = [];
afterEach(async () => {
  for (const id of workspaces.splice(0))
    await db.workspace.delete({ where: { id } });
  for (const id of users.splice(0)) await db.user.delete({ where: { id } });
  delete process.env.AFTERSERVICE_ASSISTANT_MONTHLY_TOKENS;
  delete process.env.AFTERSERVICE_ASSISTANT_CAPABILITIES;
});
async function fixture(
  role: "owner" | "admin" | "staff" = "owner",
  workspaceId?: string,
) {
  const user = await db.user.create({
    data: {
      email: `assistant-${randomUUID()}@afterservice.invalid`,
      name: "Assistant Operator",
    },
  });
  users.push(user.id);
  const ws = workspaceId
    ? await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })
    : await db.workspace.create({
        data: { name: "Assistant Workshop", slug: `assistant-${randomUUID()}` },
      });
  if (!workspaceId) workspaces.push(ws.id);
  const member = await db.membership.create({
    data: { userId: user.id, workspaceId: ws.id, role },
  });
  const ctx: ApiContext = {
    requestId: randomUUID(),
    user,
    session: null,
    platformRole: "user",
    workspace: { id: ws.id, slug: ws.slug, role },
  };
  const caller = appRouter.createCaller(ctx);
  const conversation = await caller.assistant.createConversation();
  const scope = { actorId: user.id, workspaceId: ws.id };
  return { user, ws, member, ctx, caller, conversation, scope };
}
async function draft(
  f: Awaited<ReturnType<typeof fixture>>,
  action: AssistantAction,
) {
  return f.caller.assistant.draft({
    conversationId: f.conversation.id,
    action,
    timeZone: "Africa/Lagos",
  });
}
async function execute(
  f: Awaited<ReturnType<typeof fixture>>,
  action: AssistantAction,
) {
  const p = await draft(f, action);
  return f.caller.assistant.confirm({
    id: p.id,
    revision: p.revision,
    digest: p.digest,
  });
}
test("conversations are actor-private even inside one workspace; foreign targets never draft", async () => {
  const own = await fixture();
  const peer = await fixture("staff", own.ws.id);
  const other = await fixture();
  expect(
    (await peer.caller.assistant.conversations()).map((c) => c.id),
  ).not.toContain(own.conversation.id);
  await expect(
    peer.caller.assistant.conversation({ id: own.conversation.id }),
  ).rejects.toThrow("not found");
  const customer = await other.caller.customers.create({ name: "Foreign" });
  await expect(
    draft(own, {
      action: "customer.update",
      input: { id: customer.item.id, name: "Intrusion" },
    }),
  ).rejects.toThrow();
  await expect(
    peer.caller.assistant.renameConversation({
      id: own.conversation.id,
      title: "Intrusion",
    }),
  ).rejects.toThrow();
});
test("draft/edit/exact review/concurrent confirm creates one customer and one receipt", async () => {
  const f = await fixture();
  const p = await draft(f, {
    action: "customer.create",
    input: { name: "Ada Draft", phone: "123" },
  });
  expect(await db.customer.count({ where: { workspaceId: f.ws.id } })).toBe(0);
  const edited = await f.caller.assistant.edit({
    id: p.id,
    revision: p.revision,
    conversationId: f.conversation.id,
    timeZone: "Africa/Lagos",
    action: {
      action: "customer.create",
      input: { name: "Ada Reviewed", phone: "123" },
    },
  });
  await expect(
    f.caller.assistant.confirm({
      id: p.id,
      revision: p.revision,
      digest: p.digest,
    }),
  ).rejects.toThrow("changed");
  const [one, two] = await Promise.all([
    f.caller.assistant.confirm({
      id: edited.id,
      revision: edited.revision,
      digest: edited.digest,
    }),
    f.caller.assistant.confirm({
      id: edited.id,
      revision: edited.revision,
      digest: edited.digest,
    }),
  ]);
  expect(one.id).toBe(two.id);
  expect(
    await db.customer.count({
      where: { workspaceId: f.ws.id, name: "Ada Reviewed" },
    }),
  ).toBe(1);
  expect(
    await db.assistantActionReceipt.count({ where: { proposalId: p.id } }),
  ).toBe(1);
});
test("updates preserve omitted fields and reject stale records", async () => {
  const f = await fixture();
  const c = await f.caller.customers.create({
    name: "Ada",
    email: "ada@afterservice.invalid",
    phone: "123",
    notes: "Keep",
    tags: "vip,repair",
  });
  const p = await draft(f, {
    action: "customer.update",
    input: { id: c.item.id, name: "Ada New" },
  });
  await f.caller.assistant.confirm({
    id: p.id,
    revision: p.revision,
    digest: p.digest,
  });
  const updated = await db.customer.findUniqueOrThrow({
    where: { id: c.item.id },
  });
  expect(updated.email).toBe(c.item.email);
  expect(updated.notes).toBe("Keep");
  expect(updated.tags).toEqual(["vip", "repair"]);
  const stale = await draft(f, {
    action: "customer.update",
    input: { id: c.item.id, name: "Stale" },
  });
  await f.caller.customers.update({ id: c.item.id, name: "Changed Elsewhere" });
  await expect(
    f.caller.assistant.confirm({
      id: stale.id,
      revision: stale.revision,
      digest: stale.digest,
    }),
  ).rejects.toThrow("changed");
});
test("cancel, expiry, current roles and revoked membership prevent writes", async () => {
  const f = await fixture();
  const p = await draft(f, {
    action: "customer.create",
    input: { name: "Canceled" },
  });
  await f.caller.assistant.cancel({ id: p.id, revision: p.revision });
  await expect(
    f.caller.assistant.confirm({
      id: p.id,
      revision: p.revision,
      digest: p.digest,
    }),
  ).rejects.toThrow();
  const expired = await draft(f, {
    action: "customer.create",
    input: { name: "Expired" },
  });
  await db.assistantProposal.update({
    where: { id: expired.id },
    data: { expiresAt: new Date(0) },
  });
  await expect(
    f.caller.assistant.confirm({
      id: expired.id,
      revision: expired.revision,
      digest: expired.digest,
    }),
  ).rejects.toThrow();
  const settings = await draft(f, {
    action: "workspace.update",
    input: { name: "Should not save" },
  });
  await db.membership.update({
    where: { id: f.member.id },
    data: { role: "staff" },
  });
  await expect(
    f.caller.assistant.confirm({
      id: settings.id,
      revision: settings.revision,
      digest: settings.digest,
    }),
  ).rejects.toThrow("Owner or admin");
  await expect(
    draft(f, { action: "workspace.update", input: { name: "Staff" } }),
  ).rejects.toThrow();
  await db.membership.delete({ where: { id: f.member.id } });
  await expect(
    f.caller.assistant.conversation({ id: f.conversation.id }),
  ).rejects.toThrow();
  expect(await db.customer.count({ where: { workspaceId: f.ws.id } })).toBe(0);
});
test("complete job and follow-up lifecycle uses canonical records, exact money and no surprise delivery", async () => {
  const f = await fixture();
  const customer = await execute(f, {
    action: "customer.create",
    input: { name: "Musa", email: "musa@afterservice.invalid", phone: "0800" },
  });
  const job = await execute(f, {
    action: "job.create",
    input: {
      customerId: customer.recordId,
      title: "AC repair",
      completedAt: "2026-10-23T09:00",
      amount: "25000.01",
      currency: "NGN",
    },
  });
  const savedJob = await db.serviceJob.findUniqueOrThrow({
    where: { id: job.recordId },
  });
  expect(savedJob.amountCents).toBe(2500001);
  expect(savedJob.currency).toBe("NGN");
  expect(savedJob.completedAt.toISOString()).toBe("2026-10-23T08:00:00.000Z");
  const followUp = await execute(f, {
    action: "job.followUp",
    input: { jobId: job.recordId, dueAt: "2026-10-30T09:00", channel: "phone" },
  });
  await execute(f, {
    action: "followUp.update",
    input: { id: followUp.recordId, notes: "Check repair" },
  });
  await execute(f, {
    action: "followUp.reschedule",
    input: { id: followUp.recordId, dueAt: "2026-10-31T10:00" },
  });
  await execute(f, {
    action: "followUp.assign",
    input: { id: followUp.recordId, assigneeId: f.member.id },
  });
  expect(await db.messageLog.count({ where: { workspaceId: f.ws.id } })).toBe(
    0,
  );
  await execute(f, {
    action: "followUp.logPhone",
    input: {
      id: followUp.recordId,
      recipient: "0800",
      body: "Called Musa; repair works.",
    },
  });
  await execute(f, {
    action: "followUp.reply",
    input: { id: followUp.recordId, notes: "Customer is happy" },
  });
  await execute(f, {
    action: "followUp.close",
    input: { id: followUp.recordId, notes: "Resolved" },
  });
  expect(
    (await f.caller.followUps.get({ id: followUp.recordId })).item.status,
  ).toBe("closed");
  expect(
    await db.messageLog.count({
      where: { workspaceId: f.ws.id, channel: "phone" },
    }),
  ).toBe(1);
  await execute(f, {
    action: "job.update",
    input: { id: job.recordId, notes: "Updated notes" },
  });
  expect(
    (await db.serviceJob.findUniqueOrThrow({ where: { id: job.recordId } }))
      .currency,
  ).toBe("NGN");
});
test("templates, settings, reporting and directory reads cover basic operations", async () => {
  const f = await fixture();
  const created = await execute(f, {
    action: "template.create",
    input: {
      name: "Check-in",
      channel: "phone",
      body: "Hi {{customer_name}}",
      isDefault: false,
    },
  });
  await execute(f, {
    action: "template.update",
    input: { id: created.recordId, body: "Hello {{customer_name}}" },
  });
  await execute(f, {
    action: "template.default",
    input: { id: created.recordId },
  });
  expect(
    (await f.caller.templates.get({ id: created.recordId })).item.isDefault,
  ).toBe(true);
  await execute(f, {
    action: "workspace.update",
    input: { defaultFollowUpDelayDays: 3 },
  });
  expect(
    (await f.caller.workspace.getCurrent()).item.defaultFollowUpDelayDays,
  ).toBe(3);
  for (const kind of [
    "overview",
    "customers",
    "jobs",
    "followUps",
    "templates",
    "members",
    "settings",
    "billing",
    "help",
  ] as const)
    expect(
      await readAssistantWorkspace(db, f.scope, { kind }, "Africa/Lagos"),
    ).toHaveProperty("kind");
  const report = await readAssistantWorkspace(
    db,
    f.scope,
    { kind: "report", from: "2026-10-01", to: "2026-10-31" },
    "Africa/Lagos",
  );
  expect(report.kind).toBe("summary");
  await execute(f, {
    action: "template.archive",
    input: { id: created.recordId },
  });
  expect(
    await db.followUpTemplate.count({ where: { id: created.recordId } }),
  ).toBe(0);
});
test("local command plus receipt failure rolls back, and chat deletion preserves minimal business receipts", async () => {
  const f = await fixture();
  const p = await draft(f, {
    action: "customer.create",
    input: { name: "Rollback" },
  });
  await expect(
    confirmAssistantProposal(
      db,
      f.scope,
      { id: p.id, revision: p.revision, digest: p.digest },
      async (tx) => {
        await domainRouter
          .createCaller({ ...f.ctx, db: tx, recordOnly: true, afterCommit: [] })
          .customers.create({ name: "Rollback" });
        throw Error("Receipt failure");
      },
    ),
  ).rejects.toThrow("Receipt failure");
  expect(await db.customer.count({ where: { workspaceId: f.ws.id } })).toBe(0);
  const receipt = await f.caller.assistant.confirm({
    id: p.id,
    revision: p.revision,
    digest: p.digest,
  });
  await f.caller.assistant.deleteConversation({ id: f.conversation.id });
  expect(
    await db.assistantProposal.count({
      where: { conversationId: f.conversation.id },
    }),
  ).toBe(0);
  expect(
    await db.assistantActionReceipt.findUnique({ where: { id: receipt.id } }),
  ).not.toBeNull();
});
test("plan limits, capability rollout and exact request origin stay authoritative", async () => {
  const f = await fixture();
  await db.customer.createMany({
    data: Array.from({ length: 100 }, (_, i) => ({
      workspaceId: f.ws.id,
      name: `Limit ${i}`,
    })),
  });
  const p = await draft(f, {
    action: "customer.create",
    input: { name: "Over limit" },
  });
  await expect(
    f.caller.assistant.confirm({
      id: p.id,
      revision: p.revision,
      digest: p.digest,
    }),
  ).rejects.toThrow("limit");
  process.env.AFTERSERVICE_ASSISTANT_CAPABILITIES = "template.create";
  await expect(
    draft(f, { action: "customer.create", input: { name: "Disabled" } }),
  ).rejects.toThrow("not enabled");
  const forged = appRouter.createCaller({
    ...f.ctx,
    request: { method: "POST", origin: "https://evil.example" },
  });
  await expect(forged.assistant.createConversation()).rejects.toThrow("origin");
});
test("workspace token admission reserves concurrently, reconciles and prevents duplicate requests", async () => {
  const f = await fixture();
  process.env.AFTERSERVICE_ASSISTANT_MONTHLY_TOKENS = "128000";
  const request = {
    conversationId: f.conversation.id,
    requestKey: randomUUID(),
    provider: "test",
    model: "test",
    message: "Hello",
  };
  const run = await admitAssistantRun(db, f.scope, request);
  await expect(
    admitAssistantRun(db, f.scope, { ...request, requestKey: randomUUID() }),
  ).rejects.toThrow();
  await finishAssistantRun(db, f.ws.id, run.id, {
    state: "completed",
    tokens: 37,
  });
  await finishAssistantRun(db, f.ws.id, run.id, {
    state: "completed",
    tokens: 37,
  });
  const allowance = await assistantAllowance(db, f.scope);
  expect(allowance.tokens).toBe(37);
  expect(allowance.reserved).toBe(0);
  expect(allowance.remaining).toBe(127963);
  await expect(admitAssistantRun(db, f.scope, request)).rejects.toThrow(
    "already submitted",
  );
});
test("actual streaming runtime calls read/draft tools and persists cards without executing a write", async () => {
  const f = await fixture();
  let call = 0;
  const model = new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream<LanguageModelV3StreamPart>({
        chunks:
          call++ === 0
            ? [
                {
                  type: "tool-call",
                  toolCallId: "draft",
                  toolName: "draftAction",
                  input: JSON.stringify({
                    proposal: {
                      action: "customer.create",
                      input: { name: "Streamed Draft" },
                    },
                  }),
                },
                {
                  type: "finish",
                  finishReason: { unified: "tool-calls", raw: "tool_calls" },
                  usage: {
                    inputTokens: {
                      total: 10,
                      noCache: 10,
                      cacheRead: 0,
                      cacheWrite: 0,
                    },
                    outputTokens: { total: 10, text: 10, reasoning: 0 },
                  },
                },
              ]
            : [
                { type: "text-start", id: "text" },
                {
                  type: "text-delta",
                  id: "text",
                  delta: "Review the customer draft.",
                },
                { type: "text-end", id: "text" },
                {
                  type: "finish",
                  finishReason: { unified: "stop", raw: "stop" },
                  usage: {
                    inputTokens: {
                      total: 10,
                      noCache: 10,
                      cacheRead: 0,
                      cacheWrite: 0,
                    },
                    outputTokens: { total: 10, text: 10, reasoning: 0 },
                  },
                },
              ],
      }),
    }),
  });
  const response = await assistantChatResponse(
    new Request("https://assistant-afterservice.localhost/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({
        conversationId: f.conversation.id,
        requestKey: randomUUID(),
        message: "Add a customer",
        timeZone: "Africa/Lagos",
      }),
    }),
    f.ctx,
    { model, provider: "test", modelId: "test" },
  );
  const stream = await response.text();
  expect(stream).toContain('"kind":"proposal"');
  expect(stream).toContain('"type":"done"');
  expect(await db.customer.count({ where: { workspaceId: f.ws.id } })).toBe(0);
  const conversation = await f.caller.assistant.conversation({
    id: f.conversation.id,
  });
  expect(conversation.messages).toHaveLength(2);
  expect(conversation.run?.state).toBe("completed");
  expect(conversation.proposals).toHaveLength(1);
});

test("remaining basic mutations use canonical archive, completion and direct follow-up paths", async () => {
  const f = await fixture();
  const customer = await execute(f, {
    action: "customer.create",
    input: { name: "Direct Path" },
  });
  const job = await execute(f, {
    action: "job.create",
    input: {
      customerId: customer.recordId,
      title: "Direct Repair",
      completedAt: "2026-10-20T10:00",
    },
  });
  await execute(f, { action: "job.complete", input: { id: job.recordId } });
  const followUp = await execute(f, {
    action: "followUp.create",
    input: {
      customerId: customer.recordId,
      jobId: job.recordId,
      channel: "email",
      dueAt: "2026-10-30T10:00",
      notes: "No auto-send",
    },
  });
  expect(
    (await f.caller.followUps.get({ id: followUp.recordId })).item.channel,
  ).toBe("email");
  expect(await db.messageLog.count({ where: { workspaceId: f.ws.id } })).toBe(
    0,
  );
  await expect(
    draft(f, {
      action: "followUp.logPhone",
      input: { id: followUp.recordId, body: "Should fail", recipient: "123" },
    }),
  ).rejects.toThrow("phone follow-up");
  await expect(
    draft(f, {
      action: "followUp.update",
      input: { id: followUp.recordId, status: "sent" },
    }),
  ).rejects.toThrow("dedicated");
  await execute(f, {
    action: "customer.archive",
    input: { id: customer.recordId },
  });
  expect(
    (await db.customer.findUniqueOrThrow({ where: { id: customer.recordId } }))
      .archivedAt,
  ).not.toBeNull();
  const billing = await f.caller.assistant.read({
    read: { kind: "billing" },
    timeZone: "Africa/Lagos",
  });
  expect(billing.kind).toBe("summary");
  if (billing.kind === "summary")
    expect(billing.facts.find((v) => v.label === "Plan")?.value).toBe(
      "Free Beta",
    );
});

test("malformed transport is rejected and expired runs reconcile conservatively", async () => {
  const f = await fixture();
  const request = new Request(
    "https://assistant-afterservice.localhost/api/assistant/chat",
    { method: "POST", body: "{" },
  );
  expect((await assistantChatResponse(request, f.ctx)).status).toBe(400);
  const run = await admitAssistantRun(db, f.scope, {
    conversationId: f.conversation.id,
    requestKey: randomUUID(),
    provider: "test",
    model: "test",
    message: "Interrupted",
  });
  await db.assistantRun.update({
    where: { id: run.id },
    data: { expiresAt: new Date(0) },
  });
  const allowance = await assistantAllowance(db, f.scope);
  expect(allowance.reserved).toBe(0);
  expect(allowance.tokens).toBe(run.reservedTokens);
  expect(
    (await f.caller.assistant.conversation({ id: f.conversation.id })).run
      ?.state,
  ).toBe("interrupted");
});

test("saved action versions cannot execute under a different capability contract", async () => {
  const f = await fixture();
  const p = await draft(f, {
    action: "customer.create",
    input: { name: "Old version" },
  });
  await db.assistantProposal.update({
    where: { id: p.id },
    data: { capabilityVersion: 99 },
  });
  await expect(
    f.caller.assistant.confirm({
      id: p.id,
      revision: p.revision,
      digest: p.digest,
    }),
  ).rejects.toThrow("older action version");
  expect(await db.customer.count({ where: { workspaceId: f.ws.id } })).toBe(0);
});

test("customer history reads paginate without mixing workspace or customer records", async () => {
  const f = await fixture();
  const other = await fixture();
  const customer = await f.caller.customers.create({
    name: "History customer",
  });
  await db.serviceJob.createMany({
    data: Array.from({ length: 12 }, (_, i) => ({
      workspaceId: f.ws.id,
      customerId: customer.item.id,
      title: `History ${i}`,
      completedAt: new Date(),
    })),
  });
  const first = await f.caller.assistant.read({
    read: { kind: "jobs", customerId: customer.item.id },
    timeZone: "Africa/Lagos",
  });
  expect(first.kind).toBe("records");
  if (first.kind !== "records") throw Error("Expected records");
  expect(first.records).toHaveLength(10);
  expect(first.nextCursor).toBeTruthy();
  const next = await f.caller.assistant.read({
    read: {
      kind: "jobs",
      customerId: customer.item.id,
      cursor: first.nextCursor ?? undefined,
    },
    timeZone: "Africa/Lagos",
  });
  if (next.kind !== "records") throw Error("Expected records");
  expect(next.records).toHaveLength(2);
  const denied = await other.caller.assistant.read({
    read: { kind: "jobs", customerId: customer.item.id },
    timeZone: "Africa/Lagos",
  });
  if (denied.kind !== "records") throw Error("Expected records");
  expect(denied.records).toHaveLength(0);
});
