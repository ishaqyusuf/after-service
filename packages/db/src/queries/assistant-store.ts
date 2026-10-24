import { createHash } from "node:crypto";
import {
  type AssistantAction,
  type AssistantScope,
  capabilityManifest,
} from "@afterservice/assistant";
import type { Prisma, PrismaClient } from "../../generated/prisma/client";
export type AssistantDb = PrismaClient | Prisma.TransactionClient;
export class AssistantError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "CONFLICT"
      | "BAD_REQUEST"
      | "TOO_MANY_REQUESTS",
    message: string,
  ) {
    super(message);
  }
}
export function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}
export async function assistantTransaction<T>(
  db: PrismaClient,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(work, {
        isolationLevel: "Serializable",
        maxWait: 10000,
        timeout: 15000,
      });
    } catch (error) {
      let cause: unknown = error;
      let retry = false;
      for (
        let depth = 0;
        depth < 5 && cause && typeof cause === "object";
        depth++
      ) {
        if (
          "code" in cause &&
          (cause.code === "P2034" ||
            (cause.code === "P2002" &&
              "meta" in cause &&
              JSON.stringify(cause.meta).includes("AssistantActionReceipt")))
        )
          retry = true;
        cause = "cause" in cause ? cause.cause : undefined;
      }
      if (attempt < 3 && retry) continue;
      throw error;
    }
  }
}
export async function requireAssistantScope(
  db: AssistantDb,
  scope: AssistantScope,
) {
  const member = await db.membership.findFirst({
    where: {
      userId: scope.actorId,
      workspaceId: scope.workspaceId,
      workspace: { qaPurgeStartedAt: null },
    },
    select: { id: true, role: true },
  });
  if (!member)
    throw new AssistantError(
      "FORBIDDEN",
      "Workspace access is no longer available.",
    );
  return member;
}
export async function requireConversation(
  db: AssistantDb,
  scope: AssistantScope,
  id: string,
) {
  await requireAssistantScope(db, scope);
  const item = await db.assistantConversation.findFirst({
    where: { id, ...scope },
  });
  if (!item) throw new AssistantError("NOT_FOUND", "Conversation not found.");
  return item;
}
export async function listAssistantConversations(
  db: AssistantDb,
  scope: AssistantScope,
) {
  await requireAssistantScope(db, scope);
  return db.assistantConversation.findMany({
    where: scope,
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
}
export async function createAssistantConversation(
  db: AssistantDb,
  scope: AssistantScope,
) {
  await requireAssistantScope(db, scope);
  return db.assistantConversation.create({ data: scope });
}
export async function readAssistantConversation(
  db: AssistantDb,
  scope: AssistantScope,
  id: string,
) {
  const item = await requireConversation(db, scope, id);
  const [messages, proposals, run] = await Promise.all([
    db.assistantMessage.findMany({
      where: { conversationId: id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
    }),
    db.assistantProposal.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    db.assistantRun.findFirst({
      where: { conversationId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, state: true, errorCode: true, expiresAt: true },
    }),
  ]);
  return { ...item, messages: messages.reverse(), proposals, run };
}
export async function renameAssistantConversation(
  db: AssistantDb,
  scope: AssistantScope,
  id: string,
  title: string,
) {
  await requireConversation(db, scope, id);
  return db.assistantConversation.update({ where: { id }, data: { title } });
}
export async function deleteAssistantConversation(
  db: PrismaClient,
  scope: AssistantScope,
  id: string,
) {
  return assistantTransaction(db, async (tx) => {
    await requireConversation(tx, scope, id);
    if (
      await tx.assistantRun.count({
        where: { conversationId: id, state: "running" },
      })
    )
      throw new AssistantError(
        "CONFLICT",
        "Stop the current reply before deleting this chat.",
      );
    // Business receipts retain only record references; chat and draft content cascade.
    await tx.assistantConversation.delete({ where: { id } });
    return { deleted: true };
  });
}
export type ProposalSnapshot = {
  kind: "customer" | "job" | "followUp" | "template" | "workspace" | "member";
  id: string;
  updatedAt: string;
  before: Record<string, unknown>;
}[];
export function proposalDigest(
  action: AssistantAction,
  snapshot: ProposalSnapshot,
  revision: number,
) {
  return createHash("sha256")
    .update(JSON.stringify({ action, snapshot, revision }))
    .digest("hex");
}
export async function saveAssistantProposal(
  db: PrismaClient,
  scope: AssistantScope,
  input: {
    conversationId: string;
    action: AssistantAction;
    prepare: (
      tx: Prisma.TransactionClient,
      action: AssistantAction,
    ) => Promise<{ action: AssistantAction; snapshot: ProposalSnapshot }>;
    id?: string;
    revision?: number;
  },
) {
  return assistantTransaction(db, async (tx) => {
    await requireConversation(tx, scope, input.conversationId);
    const prepared = await input.prepare(tx, input.action);
    if (input.id) {
      const old = await tx.assistantProposal.findFirst({
        where: {
          id: input.id,
          conversationId: input.conversationId,
          state: "draft",
          revision: input.revision,
          expiresAt: { gt: new Date() },
        },
      });
      if (!old)
        throw new AssistantError(
          "CONFLICT",
          "This draft changed or expired. Reload it before editing.",
        );
      if (old.action !== prepared.action.action)
        throw new AssistantError(
          "BAD_REQUEST",
          "Editing cannot change the type of action.",
        );
      const revision = old.revision + 1;
      return tx.assistantProposal.update({
        where: { id: old.id },
        data: {
          revision,
          payload: jsonValue(prepared.action),
          snapshot: jsonValue(prepared.snapshot),
          digest: proposalDigest(prepared.action, prepared.snapshot, revision),
          expiresAt: new Date(Date.now() + 30 * 60000),
        },
      });
    }
    const proposal = await tx.assistantProposal.create({
      data: {
        conversationId: input.conversationId,
        action: prepared.action.action,
        payload: jsonValue(prepared.action),
        snapshot: jsonValue(prepared.snapshot),
        digest: proposalDigest(prepared.action, prepared.snapshot, 1),
        expiresAt: new Date(Date.now() + 30 * 60000),
      },
    });
    return proposal;
  });
}
export async function cancelAssistantProposal(
  db: PrismaClient,
  scope: AssistantScope,
  id: string,
  revision: number,
) {
  return assistantTransaction(db, async (tx) => {
    await requireAssistantScope(tx, scope);
    const result = await tx.assistantProposal.updateMany({
      where: { id, revision, state: "draft", conversation: scope },
      data: { state: "canceled" },
    });
    if (!result.count)
      throw new AssistantError(
        "CONFLICT",
        "The draft changed or has already been handled.",
      );
    return { canceled: true };
  });
}
export async function confirmAssistantProposal(
  db: PrismaClient,
  scope: AssistantScope,
  input: { id: string; revision: number; digest: string },
  execute: (
    tx: Prisma.TransactionClient,
    payload: Prisma.JsonValue,
    snapshot: Prisma.JsonValue,
  ) => Promise<{
    recordId: string;
    href: string;
    afterCommit: (() => Promise<void>)[];
  }>,
) {
  const result = await assistantTransaction(db, async (tx) => {
    await requireAssistantScope(tx, scope);
    const proposal = await tx.assistantProposal.findFirst({
      where: { id: input.id, conversation: scope },
    });
    if (!proposal) throw new AssistantError("NOT_FOUND", "Draft not found.");
    if (
      proposal.revision !== input.revision ||
      proposal.digest !== input.digest
    )
      throw new AssistantError(
        "CONFLICT",
        "The draft changed. Review its latest version.",
      );
    const capability = capabilityManifest.find(
      (item) => item.id === proposal.action,
    );
    if (!capability || proposal.capabilityVersion !== capability.version)
      throw new AssistantError(
        "CONFLICT",
        "This draft uses an older action version. Prepare a new draft.",
      );
    if (proposal.state === "confirmed") {
      const receipt = await tx.assistantActionReceipt.findFirstOrThrow({
        where: { proposalId: proposal.id, ...scope },
      });
      return { receipt, afterCommit: [] };
    }
    if (proposal.state !== "draft" || proposal.expiresAt <= new Date())
      throw new AssistantError(
        "CONFLICT",
        "This draft is canceled or expired. Prepare a new draft.",
      );
    const outcome = await execute(tx, proposal.payload, proposal.snapshot);
    const receipt = await tx.assistantActionReceipt.create({
      data: {
        ...scope,
        proposalId: proposal.id,
        revision: proposal.revision,
        action: proposal.action,
        recordId: outcome.recordId,
        href: outcome.href,
      },
    });
    await tx.assistantProposal.update({
      where: { id: proposal.id },
      data: { state: "confirmed" },
    });
    await tx.assistantConversation.update({
      where: { id: proposal.conversationId },
      data: { updatedAt: new Date() },
    });
    return { receipt, afterCommit: outcome.afterCommit };
  });
  for (const effect of result.afterCommit) {
    try {
      await effect();
    } catch {
      /* Saved business changes do not depend on optional analytics. */
    }
  }
  return result.receipt;
}
