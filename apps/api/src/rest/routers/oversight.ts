import { timingSafeEqual } from "node:crypto";
import {
  getOversightBusinesses,
  getOversightDbClient,
  getOversightRecords,
  getOversightSummary,
  getOversightUsers,
} from "@afterservice/db";
import { Hono } from "hono";
import {
  oversightDirectoryQuery,
  oversightSummaryQuery,
} from "../../schemas/oversight";

const app = new Hono();

app.use("*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  const expected = process.env.OVERSIGHT_READ_KEY;
  if (
    process.env.OVERSIGHT_ENABLED !== "true" ||
    !expected ||
    expected.length < 32
  ) {
    return c.json({ error: "Oversight integration is not configured" }, 503);
  }
  const provided = c.req.header("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (
    !provided ||
    Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

app.onError((_error, c) =>
  c.json({ error: "Afterservice operational data is unavailable" }, 503),
);

app.get("/summary", async (c) => {
  const parsed = oversightSummaryQuery.safeParse(c.req.query());
  if (!parsed.success)
    return c.json({ error: "Invalid reporting period" }, 400);
  return c.json(
    await getOversightSummary(getOversightDbClient(), parsed.data.days),
  );
});

for (const [path, query] of [
  ["/businesses", getOversightBusinesses],
  ["/users", getOversightUsers],
  ["/records", getOversightRecords],
] as const) {
  app.get(path, async (c) => {
    const parsed = oversightDirectoryQuery.safeParse(c.req.query());
    if (!parsed.success)
      return c.json({ error: "Invalid directory query" }, 400);
    return c.json(await query(getOversightDbClient(), parsed.data));
  });
}

export default app;
