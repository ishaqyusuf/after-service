import type { LanguageModelV3StreamPart } from "@ai-sdk/provider";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { assistantChatResponse } from "../../apps/api/src/assistant/chat";
import { createContext } from "../../apps/api/src/context";
import { assertLocalTestDatabase } from "./local-env";

assertLocalTestDatabase();
if (new URL(process.env.DATABASE_URL!).pathname !== "/afterservice_assistant")
  throw Error(
    "Assistant rehearsal requires the isolated afterservice_assistant database.",
  );
function fixtureModel() {
  return new MockLanguageModelV3({
    doStream: async (options) => {
      const last = options.prompt.at(-1);
      const hasResult = last?.role === "tool";
      const user = [...options.prompt].reverse().find((p) => p.role === "user");
      const message = JSON.stringify(user?.content ?? "");
      const usage = {
        inputTokens: { total: 20, noCache: 20, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: 20, text: 20, reasoning: 0 },
      };
      const turn = message.includes("Assistant Browser Customer")
        ? {
            toolName: "draftAction",
            input: {
              action: "customer.create",
              input: {
                name: "Assistant Browser Customer",
                email: "assistant-browser@afterservice.invalid",
              },
            },
          }
        : message.includes("check-in")
          ? {
              toolName: "draftMessage",
              input: {
                title: "Post-service check-in",
                body: "Hi, just checking that everything is working well after your recent service. Let us know if you need a hand.",
              },
            }
          : { toolName: "readWorkspace", input: { kind: "overview" } };
      return {
        stream: simulateReadableStream<LanguageModelV3StreamPart>({
          chunkDelayInMs: 15,
          chunks: hasResult
            ? [
                { type: "text-start", id: "text" },
                {
                  type: "text-delta",
                  id: "text",
                  delta: "Here is the draft to review.",
                },
                { type: "text-end", id: "text" },
                {
                  type: "finish",
                  finishReason: { unified: "stop", raw: "stop" },
                  usage,
                },
              ]
            : [
                {
                  type: "tool-call",
                  toolCallId: crypto.randomUUID(),
                  toolName: turn.toolName,
                  input: JSON.stringify(
                    turn.toolName === "draftAction"
                      ? { proposal: turn.input }
                      : turn.input,
                  ),
                },
                {
                  type: "finish",
                  finishReason: { unified: "tool-calls", raw: "tool_calls" },
                  usage,
                },
              ],
        }),
      };
    },
  });
}
Bun.serve({
  hostname: "127.0.0.1",
  port: 4199,
  async fetch(request) {
    if (new URL(request.url).pathname === "/health")
      return Response.json({ ok: true });
    const ctx = await createContext(request);
    if (
      !ctx.user?.email.startsWith("browser-") ||
      !ctx.user.email.endsWith("@afterservice.invalid")
    )
      return new Response("Synthetic browser identity required", {
        status: 403,
      });
    try {
      return await assistantChatResponse(request, ctx, {
        model: fixtureModel(),
        provider: "local-test-adapter",
        modelId: "assistant-browser-fixtures",
      });
    } catch {
      return Response.json({ error: "Rehearsal failed" }, { status: 500 });
    }
  },
});
