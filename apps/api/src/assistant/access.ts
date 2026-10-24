import { assistantModel } from "@afterservice/ai";
import {
  AssistantError,
  getDbClient,
  requireAssistantScope,
} from "@afterservice/db";
import { TRPCError } from "@trpc/server";
import type { ApiContext } from "../context";
export function assistantScope(ctx: ApiContext) {
  if (!ctx.user || !ctx.workspace)
    throw new TRPCError({ code: "UNAUTHORIZED" });
  return { actorId: ctx.user.id, workspaceId: ctx.workspace.id };
}
export async function assistantAvailability(ctx: ApiContext) {
  const scope = assistantScope(ctx);
  const member = await requireAssistantScope(getDbClient(), scope);
  const allowlist = process.env.AFTERSERVICE_ASSISTANT_WORKSPACES?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const enabled =
    process.env.AFTERSERVICE_ASSISTANT_ENABLED === "true" &&
    (!allowlist?.length || allowlist.includes(scope.workspaceId));
  let configured = false;
  try {
    configured = Boolean(assistantModel());
  } catch {
    /* Invalid provider configuration is unavailable. */
  }
  return {
    enabled,
    configured,
    role: member.role,
    actorId: scope.actorId,
    workspaceId: scope.workspaceId,
  };
}
export async function requireAssistantEnabled(ctx: ApiContext) {
  const availability = await assistantAvailability(ctx);
  if (!availability.enabled)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "The assistant is not enabled for this workspace.",
    });
  return availability;
}
export function assistantApiError(error: unknown) {
  if (error instanceof TRPCError) return error;
  if (error instanceof AssistantError)
    return new TRPCError({ code: error.code, message: error.message });
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "ZodError"
  )
    return new TRPCError({
      code: "BAD_REQUEST",
      message:
        "The draft contains invalid or missing fields. Review the details.",
    });
  console.error("Assistant operation failed", {
    name: error instanceof Error ? error.name : "unknown",
    code:
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "unknown",
  });
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      "The assistant could not finish. Check the saved conversation before retrying.",
  });
}
