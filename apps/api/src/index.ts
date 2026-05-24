import { getAppUrls } from "@afterservice/utils";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { createContext } from "./context";
import { appRouter } from "./routers/_app";

const app = new Hono();

app.get("/health", (c) => {
  const urls = getAppUrls();

  return c.json({
    ok: true,
    service: "afterservice-api",
    urls,
  });
});

app.all("/trpc/*", (c) => {
  return fetchRequestHandler({
    createContext,
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
  });
});

app.all("/api/auth/*", (c) => {
  return c.json({
    ok: true,
    route: c.req.path,
    service: "afterservice-auth-placeholder",
  });
});

app.post("/webhooks/lemon-squeezy", async (c) => {
  const body = await c.req.text();

  return c.json({
    ok: true,
    received: body.length > 0,
    service: "afterservice-lemon-squeezy-webhook-placeholder",
  });
});

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 4102),
};
