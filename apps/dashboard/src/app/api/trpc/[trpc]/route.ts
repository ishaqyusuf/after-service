import { createContext } from "@afterservice/api/context";
import { appRouter } from "@afterservice/api/router";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler(request: Request) {
  return fetchRequestHandler({
    createContext: () => createContext(request),
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
  });
}

export { handler as GET, handler as POST };
