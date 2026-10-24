import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel, streamText } from "ai";

type ProviderOptions = NonNullable<
  Parameters<typeof streamText>[0]["providerOptions"]
>;
export function assistantModel(environment: NodeJS.ProcessEnv = process.env): {
  provider: string;
  modelId: string;
  model: LanguageModel;
  providerOptions: ProviderOptions;
} | null {
  const provider =
    environment.ASSISTANT_AI_PROVIDER?.toLowerCase() ?? "deepseek";
  if (provider === "openai") {
    const key =
      environment.ASSISTANT_OPENAI_API_KEY ?? environment.OPENAI_API_KEY;
    if (!key) return null;
    const model = environment.ASSISTANT_AI_MODEL ?? "gpt-4.1-mini";
    if (!["gpt-4.1-mini", "gpt-4.1"].includes(model))
      throw Error("Unsupported assistant model.");
    return {
      provider,
      modelId: model,
      model: createOpenAI({ apiKey: key })(model),
      providerOptions: { openai: { store: false } },
    };
  }
  if (provider === "deepseek") {
    const key =
      environment.ASSISTANT_DEEPSEEK_API_KEY ??
      environment.DEEPSEEK_API_KEY ??
      environment.DEEPSEEK_API;
    if (!key) return null;
    const model = environment.ASSISTANT_AI_MODEL ?? "deepseek-flash";
    if (!["deepseek-chat", "deepseek-flash", "deepseek-v4-pro"].includes(model))
      throw Error("Unsupported assistant model.");
    return {
      provider,
      modelId: model,
      model: createDeepSeek({ apiKey: key })(model),
      providerOptions: { deepseek: { thinking: { type: "disabled" } } },
    };
  }
  throw Error("Unsupported assistant provider.");
}
