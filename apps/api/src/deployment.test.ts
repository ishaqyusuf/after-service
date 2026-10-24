import { expect, test } from "bun:test";

test("standalone Hono entrypoint preserves routing, CORS and auth boundaries", async () => {
  // These checks never connect to the database or invoke a provider.
  process.env.DATABASE_URL ??=
    "postgresql://unused:unused@localhost:5432/unused";
  process.env.BETTER_AUTH_SECRET =
    "afterservice-deployment-test-secret-32-characters";
  process.env.BETTER_AUTH_TRUSTED_ORIGINS = "https://dash.afterservice.app";
  const { default: app } = await import("./index");
  const { smokeApi } = await import("../../../scripts/smoke-api.mjs");
  const results = await smokeApi("https://api.afterservice.app", app.fetch);
  expect(results).toHaveLength(13);
});
