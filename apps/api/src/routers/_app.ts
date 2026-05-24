import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { ApiContext } from "../context";

const t = initTRPC.context<ApiContext>().create({
  transformer: superjson,
});

export const appRouter = t.router({
  health: t.procedure.query(() => ({
    ok: true,
    service: "afterservice-api",
  })),
});

export type AppRouter = typeof appRouter;
