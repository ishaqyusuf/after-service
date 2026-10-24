import { actionSchema, isTimeZone, readSchema } from "@afterservice/assistant";
import { getTrustedOrigins } from "@afterservice/auth";
import {
  assistantAllowance,
  cancelAssistantProposal,
  confirmAssistantProposal,
  createAssistantConversation,
  deleteAssistantConversation,
  getDbClient,
  listAssistantConversations,
  readAssistantConversation,
  renameAssistantConversation,
  requireAssistantScope,
  saveAssistantProposal,
} from "@afterservice/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  assistantApiError,
  assistantAvailability,
  assistantScope,
  requireAssistantEnabled,
} from "../assistant/access";
import {
  assertProposalTargets,
  type DomainCallerFactory,
  executeAssistantAction,
  operationHref,
  prepareAssistantAction,
} from "../assistant/domain-actions";
import { readAssistantOperations } from "../assistant/reads";
import { protectedProcedure, t } from "../trpc";

const id = z.string().min(1).max(100);
export const assistantTimeZone = z
  .string()
  .max(100)
  .refine(isTimeZone, "Choose a valid timezone.");
const enabledProcedure = protectedProcedure.use(async ({ ctx, next, type }) => {
  if (
    type === "mutation" &&
    ctx.request &&
    !getTrustedOrigins().includes(ctx.request.origin ?? "")
  )
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Untrusted request origin.",
    });
  await requireAssistantEnabled(ctx);
  const result = await next();
  if (!result.ok) throw assistantApiError(result.error.cause ?? result.error);
  return result;
});
export function createAssistantRouter(createCaller: DomainCallerFactory) {
  const db = getDbClient();
  return t.router({
    availability: protectedProcedure.query(({ ctx }) =>
      assistantAvailability(ctx),
    ),
    read: enabledProcedure
      .input(z.object({ read: readSchema, timeZone: assistantTimeZone }))
      .query(({ ctx, input }) =>
        readAssistantOperations(ctx, input.read, input.timeZone, createCaller),
      ),
    allowance: enabledProcedure.query(({ ctx }) =>
      assistantAllowance(db, assistantScope(ctx)),
    ),
    conversations: enabledProcedure.query(({ ctx }) =>
      listAssistantConversations(db, assistantScope(ctx)),
    ),
    createConversation: enabledProcedure.mutation(({ ctx }) =>
      createAssistantConversation(db, assistantScope(ctx)),
    ),
    conversation: enabledProcedure
      .input(z.object({ id }))
      .query(async ({ ctx, input }) => {
        const scope = assistantScope(ctx);
        await assistantAllowance(db, scope);
        const item = await readAssistantConversation(db, scope, input.id);
        const receipts = await db.assistantActionReceipt.findMany({
          where: {
            ...scope,
            proposalId: { in: item.proposals.map((p) => p.id) },
          },
        });
        return { ...item, receipts };
      }),
    renameConversation: enabledProcedure
      .input(z.object({ id, title: z.string().trim().min(1).max(80) }))
      .mutation(({ ctx, input }) =>
        renameAssistantConversation(
          db,
          assistantScope(ctx),
          input.id,
          input.title,
        ),
      ),
    deleteConversation: enabledProcedure
      .input(z.object({ id }))
      .mutation(({ ctx, input }) =>
        deleteAssistantConversation(db, assistantScope(ctx), input.id),
      ),
    draft: enabledProcedure
      .input(
        z.object({
          conversationId: id,
          action: actionSchema,
          timeZone: assistantTimeZone,
        }),
      )
      .mutation(({ ctx, input }) => {
        const scope = assistantScope(ctx);
        return saveAssistantProposal(db, scope, {
          ...input,
          prepare: (tx, action) =>
            prepareAssistantAction(tx, scope, action, input.timeZone),
        });
      }),
    edit: enabledProcedure
      .input(
        z.object({
          id,
          revision: z.number().int().positive(),
          conversationId: id,
          action: actionSchema,
          timeZone: assistantTimeZone,
        }),
      )
      .mutation(({ ctx, input }) => {
        const scope = assistantScope(ctx);
        return saveAssistantProposal(db, scope, {
          ...input,
          prepare: (tx, action) =>
            prepareAssistantAction(tx, scope, action, input.timeZone),
        });
      }),
    cancel: enabledProcedure
      .input(z.object({ id, revision: z.number().int().positive() }))
      .mutation(({ ctx, input }) =>
        cancelAssistantProposal(
          db,
          assistantScope(ctx),
          input.id,
          input.revision,
        ),
      ),
    confirm: enabledProcedure
      .input(
        z.object({
          id,
          revision: z.number().int().positive(),
          digest: z.string().length(64),
        }),
      )
      .mutation(({ ctx, input }) => {
        const scope = assistantScope(ctx);
        return confirmAssistantProposal(
          db,
          scope,
          input,
          async (tx, payload, snapshot) => {
            await assertProposalTargets(tx, scope, snapshot);
            const action = actionSchema.parse(payload);
            const allowed =
              process.env.AFTERSERVICE_ASSISTANT_CAPABILITIES?.split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            if (allowed?.length && !allowed.includes(action.action))
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "This assistant action is no longer enabled.",
              });
            const afterCommit: (() => Promise<void>)[] = [];
            const member = await requireAssistantScope(tx, scope);
            const result = await executeAssistantAction(
              createCaller({
                ...ctx,
                workspace: ctx.workspace
                  ? { ...ctx.workspace, role: member.role }
                  : null,
                db: tx,
                recordOnly: true,
                afterCommit,
              }),
              action,
            );
            const recordId = result.item.id;
            return {
              recordId,
              href: operationHref(action, recordId),
              afterCommit,
            };
          },
        );
      }),
  });
}
