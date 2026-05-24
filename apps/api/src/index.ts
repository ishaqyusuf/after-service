import { getAppUrls } from "@afterservice/utils";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => {
  const urls = getAppUrls();

  return c.json({
    ok: true,
    service: "afterservice-api",
    urls,
  });
});

export default {
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 4102),
};
