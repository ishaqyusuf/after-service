import { afterEach, expect, test } from "bun:test";
import { assertLocalTestDatabase, localBrowserUrl } from "./local-env";

const originalMode = process.env.AFTERSERVICE_ENV_MODE;
const originalDatabase = process.env.DATABASE_URL;
afterEach(() => {
  if (originalMode === undefined) delete process.env.AFTERSERVICE_ENV_MODE;
  else process.env.AFTERSERVICE_ENV_MODE = originalMode;
  if (originalDatabase === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = originalDatabase;
});

test("test fixtures accept only local mode and a loopback PostgreSQL target", () => {
  process.env.AFTERSERVICE_ENV_MODE = "local";
  process.env.DATABASE_URL =
    "postgresql://test:test@127.0.0.1:5432/afterservice";
  expect(() => assertLocalTestDatabase()).not.toThrow();
  process.env.AFTERSERVICE_ENV_MODE = "production";
  expect(() => assertLocalTestDatabase()).toThrow();
  process.env.AFTERSERVICE_ENV_MODE = "local";
  process.env.DATABASE_URL =
    "postgresql://test:test@production.example/afterservice";
  expect(() => assertLocalTestDatabase()).toThrow();
});

test("browser mutations cannot target production or a lookalike hostname", () => {
  expect(
    localBrowserUrl(
      "https://app-afterservice.localhost",
      "app-afterservice.localhost",
    ),
  ).toBe("https://app-afterservice.localhost");
  expect(() =>
    localBrowserUrl(
      "https://dash.afterservice.app",
      "app-afterservice.localhost",
    ),
  ).toThrow();
  expect(() =>
    localBrowserUrl(
      "https://app-afterservice.localhost.evil.example",
      "app-afterservice.localhost",
    ),
  ).toThrow();
});
