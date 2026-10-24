import type { AssistantCard, AssistantRead } from "@afterservice/assistant";
import {
  getDbClient,
  readAssistantWorkspace,
  requireAssistantScope,
} from "@afterservice/db";
import type { ApiContext } from "../context";
import { assistantScope } from "./access";
import type { DomainCallerFactory } from "./domain-actions";
export async function readAssistantOperations(
  ctx: ApiContext,
  read: AssistantRead,
  timeZone: string,
  createCaller: DomainCallerFactory,
): Promise<AssistantCard> {
  const scope = assistantScope(ctx);
  await requireAssistantScope(getDbClient(), scope);
  if (read.kind !== "billing")
    return readAssistantWorkspace(getDbClient(), scope, read, timeZone);
  const { item } = await createCaller(ctx).billing.getCurrentPlan();
  return {
    kind: "summary",
    title: "Plan and usage",
    asOf: new Date().toISOString(),
    facts: [
      { label: "Plan", value: item.planDisplayName },
      { label: "Status", value: item.planStatus },
      ...Object.entries(item.usage).map(([label, value]) => ({
        label,
        value: `${value.toLocaleString()} / ${item.limits[label as keyof typeof item.limits].toLocaleString()}`,
      })),
      {
        label: "Paid checkout",
        value: item.isCheckoutEnabled
          ? "Available through billing"
          : "Disabled during Free Beta",
      },
    ],
    links: [{ label: "Open billing and limits", href: "/billing" }],
  };
}
