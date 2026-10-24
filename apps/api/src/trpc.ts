import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { ApiContext } from "./context";
export const t = initTRPC
  .context<ApiContext>()
  .create({ transformer: superjson });
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  if (!ctx.workspace)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Workspace onboarding is required.",
    });
  return next({ ctx: { ...ctx, user: ctx.user, workspace: ctx.workspace } });
});
