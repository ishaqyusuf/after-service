import {
  ASSISTANT_PROMPT_VERSION,
  type AssistantScope,
} from "@afterservice/assistant";
import type { PrismaClient } from "../../generated/prisma/client";
import {
  AssistantError,
  assistantTransaction,
  requireAssistantScope,
  requireConversation,
} from "./assistant-store";
export const ASSISTANT_TURN_RESERVATION = 128000;
export function assistantMonthlyLimit() {
  const n = Number(
    process.env.AFTERSERVICE_ASSISTANT_MONTHLY_TOKENS ?? 1000000,
  );
  if (!Number.isSafeInteger(n) || n <= 0)
    throw new AssistantError(
      "BAD_REQUEST",
      "The assistant token allowance is not configured correctly.",
    );
  return n;
}

export function assistantMonth(now = new Date()) {
  return now.toISOString().slice(0, 7);
}
export async function recoverAssistantRuns(
  db: PrismaClient,
  scope: AssistantScope,
) {
  await requireAssistantScope(db, scope);
  const expired = await db.assistantRun.findMany({
    where: {
      state: "running",
      expiresAt: { lte: new Date() },
      conversation: { workspaceId: scope.workspaceId },
    },
    select: { id: true },
    take: 50,
  });
  for (const run of expired)
    await finishAssistantRun(db, scope.workspaceId, run.id, {
      state: "interrupted",
      errorCode: "REPLY_INTERRUPTED",
    });
}
export async function assistantAllowance(
  db: PrismaClient,
  scope: AssistantScope,
) {
  await recoverAssistantRuns(db, scope);
  const month = assistantMonth();
  const used = await db.assistantUsage.findUnique({
    where: { workspaceId_month: { workspaceId: scope.workspaceId, month } },
  });
  const limit = assistantMonthlyLimit();
  const tokens = used?.tokens ?? 0;
  const reserved = used?.reservedTokens ?? 0;
  return {
    tokens,
    reserved,
    limit,
    remaining: Math.max(0, limit - tokens - reserved),
    resetsAt: new Date(
      Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1),
    ).toISOString(),
    minimumTurnTokens: ASSISTANT_TURN_RESERVATION,
  };
}
export async function admitAssistantRun(
  db: PrismaClient,
  scope: AssistantScope,
  input: {
    conversationId: string;
    requestKey: string;
    provider: string;
    model: string;
    message: string;
  },
) {
  await recoverAssistantRuns(db, scope);
  return assistantTransaction(db, async (tx) => {
    const conversation = await requireConversation(
      tx,
      scope,
      input.conversationId,
    );
    const prior = await tx.assistantRun.findUnique({
      where: { requestKey: input.requestKey },
    });
    if (prior)
      throw new AssistantError(
        "CONFLICT",
        "This message was already submitted. Reload the saved conversation.",
      );
    if (
      await tx.assistantRun.count({
        where: { state: "running", conversationId: input.conversationId },
      })
    )
      throw new AssistantError(
        "CONFLICT",
        "A reply is already running in this conversation.",
      );
    const active = await tx.assistantRun.count({
      where: {
        state: "running",
        conversation: { workspaceId: scope.workspaceId },
      },
    });
    if (active >= 3)
      throw new AssistantError(
        "TOO_MANY_REQUESTS",
        "Three replies are already running. Wait for one to finish.",
      );
    const recent = await tx.assistantRun.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 60000) },
        conversation: { workspaceId: scope.workspaceId },
      },
    });
    if (recent >= 10)
      throw new AssistantError(
        "TOO_MANY_REQUESTS",
        "Too many messages. Try again in a minute.",
      );
    const month = assistantMonth();
    const usage = await tx.assistantUsage.upsert({
      where: { workspaceId_month: { workspaceId: scope.workspaceId, month } },
      create: { workspaceId: scope.workspaceId, month },
      update: {},
    });
    if (
      usage.tokens + usage.reservedTokens + ASSISTANT_TURN_RESERVATION >
      assistantMonthlyLimit()
    )
      throw new AssistantError(
        "TOO_MANY_REQUESTS",
        "The workspace does not have enough tokens for another reply this month.",
      );
    await tx.assistantUsage.update({
      where: { id: usage.id },
      data: {
        reservedTokens: { increment: ASSISTANT_TURN_RESERVATION },
        requests: { increment: 1 },
      },
    });
    const run = await tx.assistantRun.create({
      data: {
        conversationId: conversation.id,
        requestKey: input.requestKey,
        month,
        reservedTokens: ASSISTANT_TURN_RESERVATION,
        provider: input.provider,
        model: input.model,
        promptVersion: ASSISTANT_PROMPT_VERSION,
        expiresAt: new Date(Date.now() + 3 * 60000),
      },
    });
    await tx.assistantMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: input.message,
      },
    });
    await tx.assistantConversation.update({
      where: { id: conversation.id },
      data: {
        updatedAt: new Date(),
        ...(conversation.title === "New conversation"
          ? { title: input.message.slice(0, 80) }
          : {}),
      },
    });
    return run;
  });
}
export async function finishAssistantRun(
  db: PrismaClient,
  workspaceId: string,
  runId: string,
  input: {
    state: "completed" | "failed" | "interrupted";
    tokens?: number;
    errorCode?: string;
  },
) {
  return assistantTransaction(db, async (tx) => {
    const run = await tx.assistantRun.findFirst({
      where: { id: runId, state: "running", conversation: { workspaceId } },
    });
    if (!run) return;
    // If a terminated process lost usage, charge the reservation rather than grant unmetered retries.
    const tokens =
      input.tokens === undefined
        ? run.reservedTokens
        : Math.max(0, Math.ceil(input.tokens));
    await tx.assistantUsage.update({
      where: { workspaceId_month: { workspaceId, month: run.month } },
      data: {
        reservedTokens: { decrement: run.reservedTokens },
        tokens: { increment: tokens },
      },
    });
    await tx.assistantRun.update({
      where: { id: run.id },
      data: {
        state: input.state,
        usedTokens: tokens,
        completedAt: new Date(),
        errorCode: input.errorCode,
      },
    });
  });
}
