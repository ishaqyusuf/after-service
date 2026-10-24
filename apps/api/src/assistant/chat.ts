import { assistantModel } from "@afterservice/ai";
import {
  type AssistantCard,
  actionSchema,
  assistantInstructions,
  draftMessageSchema,
  readSchema,
} from "@afterservice/assistant";
import {
  admitAssistantRun,
  finishAssistantRun,
  getDbClient,
  jsonValue,
  readAssistantConversation,
  requireAssistantScope,
  saveAssistantProposal,
} from "@afterservice/db";
import { type LanguageModel, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import type { ApiContext } from "../context";
import { domainRouter } from "../routers/_app";
import { assistantTimeZone } from "../routers/assistant";
import {
  assistantApiError,
  assistantScope,
  requireAssistantEnabled,
} from "./access";
import { prepareAssistantAction } from "./domain-actions";
import { readAssistantOperations } from "./reads";
export const chatInputSchema = z
  .object({
    conversationId: z.string().min(1).max(100),
    requestKey: z.string().uuid(),
    message: z.string().trim().min(1).max(4000),
    timeZone: assistantTimeZone,
  })
  .strict();
export type ChatEvent =
  | { type: "start"; runId: string }
  | { type: "text"; text: string }
  | { type: "card"; card: AssistantCard }
  | { type: "done" }
  | { type: "error"; message: string };
export async function assistantChatResponse(
  request: Request,
  ctx: ApiContext,
  override?: { model: LanguageModel; provider: string; modelId: string },
) {
  const availability = await requireAssistantEnabled(ctx);
  const scope = assistantScope(ctx);
  const db = getDbClient();
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 16000)
    return Response.json({ error: "Message is too long." }, { status: 413 });
  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return Response.json(
      { error: "Invalid assistant message." },
      { status: 400 },
    );
  }
  const checked = chatInputSchema.safeParse(decoded);
  if (!checked.success)
    return Response.json(
      { error: checked.error.issues[0]?.message ?? "Invalid message." },
      { status: 400 },
    );
  const input = checked.data;
  const configured = assistantModel();
  const model = override ?? configured;
  if (!model)
    return Response.json(
      {
        error:
          "The assistant's AI provider is not configured. Your existing workflows are available.",
      },
      { status: 503 },
    );
  const history = await readAssistantConversation(
    db,
    scope,
    input.conversationId,
  );
  const run = await admitAssistantRun(db, scope, {
    ...input,
    provider: model.provider,
    model: model.modelId,
  });
  const encoder = new TextEncoder();
  const cards: AssistantCard[] = [];
  let text = "";
  const controller = new AbortController();
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) controller.abort();
  const timer = setTimeout(() => controller.abort(), 90000);
  let canceled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(output) {
      const emit = (event: ChatEvent) => {
        if (canceled) return;
        try {
          output.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          canceled = true;
          controller.abort();
        }
      };
      const addCard = (card: AssistantCard) => {
        cards.push(card);
        emit({ type: "card", card });
      };
      emit({ type: "start", runId: run.id });
      void (async () => {
        let tokens: number | undefined;
        let failure = false;
        try {
          const messages = history.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-8)
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content.slice(0, 1000),
            }));
          const result = streamText({
            model: model.model,
            system: assistantInstructions({
              timeZone: input.timeZone,
              now: new Date().toISOString(),
              role: availability.role,
            }),
            messages: [...messages, { role: "user", content: input.message }],
            maxOutputTokens: 2000,
            stopWhen: stepCountIs(4),
            abortSignal: controller.signal,
            maxRetries: 0,
            onError: () => {
              failure = true;
              console.error("Assistant model reply failed", {
                provider: model.provider,
                model: model.modelId,
              });
            },
            ...(configured?.providerOptions
              ? { providerOptions: configured.providerOptions }
              : {}),

            tools: {
              readWorkspace: tool({
                description:
                  "Read current authorized business records, reports, settings, billing or product help. Use exact IDs only from these reads. Paginate with nextCursor when present.",
                inputSchema: readSchema,
                execute: async (read) => {
                  try {
                    const card = await readAssistantOperations(
                      ctx,
                      read,
                      input.timeZone,
                      (context) => domainRouter.createCaller(context),
                    );
                    addCard(card);
                    return card;
                  } catch (error) {
                    return {
                      status: "unavailable",
                      message: assistantApiError(error).message,
                    };
                  }
                },
              }),
              draftAction: tool({
                description:
                  "Prepare one editable business action. Never executes. User must review and press Confirm. Preserve existing fields unless explicitly changed.",
                inputSchema: z.object({ proposal: actionSchema }).strict(),
                execute: async ({ proposal: action }) => {
                  try {
                    const proposal = await saveAssistantProposal(db, scope, {
                      conversationId: input.conversationId,
                      action,
                      prepare: (tx, value) =>
                        prepareAssistantAction(
                          tx,
                          scope,
                          value,
                          input.timeZone,
                        ),
                    });
                    addCard({ kind: "proposal", id: proposal.id });
                    return {
                      status: "draft",
                      proposalId: proposal.id,
                      reviewRequired: true,
                    };
                  } catch (error) {
                    return {
                      status: "needs_changes",
                      message: assistantApiError(error).message,
                    };
                  }
                },
              }),
              draftMessage: tool({
                description:
                  "Prepare editable customer message content. This does not send or record contact.",
                inputSchema: draftMessageSchema,
                execute: async (draft) => {
                  await requireAssistantScope(db, scope);
                  if (draft.followUpId) {
                    await db.followUp.findFirstOrThrow({
                      where: {
                        id: draft.followUpId,
                        workspaceId: scope.workspaceId,
                      },
                    });
                  }
                  const card: AssistantCard = {
                    kind: "message",
                    title: draft.title,
                    body: draft.body,
                    subject: draft.subject,
                    href: draft.followUpId
                      ? `/follow-ups?followUpId=${draft.followUpId}`
                      : undefined,
                  };
                  addCard(card);
                  return { status: "draft", sendAutomatically: false };
                },
              }),
            },
          });
          for await (const part of result.fullStream) {
            if (part.type === "text-delta") {
              text += part.text;
              emit({ type: "text", text: part.text });
            }
            if (part.type === "error") {
              failure = true;
            }
          }
          const usage = await result.totalUsage;
          tokens = usage.totalTokens;
          await requireAssistantScope(db, scope);
          if (!text && !cards.length) failure = true;
          await db.assistantMessage.create({
            data: {
              conversationId: input.conversationId,
              role: "assistant",
              content: text || "Review the saved cards below.",
              cards: jsonValue(cards),
            },
          });
          await finishAssistantRun(db, scope.workspaceId, run.id, {
            state: controller.signal.aborted
              ? "interrupted"
              : failure
                ? "failed"
                : "completed",
            tokens,
            errorCode: failure ? "MODEL_REPLY_FAILED" : undefined,
          });
          if (failure)
            emit({
              type: "error",
              message:
                "The reply could not finish. Your saved drafts are available; check them before retrying.",
            });
          else emit({ type: "done" });
        } catch {
          await finishAssistantRun(db, scope.workspaceId, run.id, {
            state: controller.signal.aborted ? "interrupted" : "failed",
            tokens,
            errorCode: "REPLY_FAILED",
          }).catch(() => {});
          emit({
            type: "error",
            message:
              "The reply stopped. Reload the conversation to check saved messages and drafts.",
          });
        } finally {
          clearTimeout(timer);
          request.signal.removeEventListener("abort", abort);
          if (!canceled) {
            try {
              output.close();
            } catch {}
          }
        }
      })();
    },
    cancel() {
      canceled = true;
      controller.abort();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
