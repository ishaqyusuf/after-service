import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  return c.json({
    ok: true,
    service: "afterservice-api",
  });
});

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 4102),
};
