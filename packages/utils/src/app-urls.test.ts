import { afterEach, expect, test } from "bun:test";
import { buildApiUrl, buildAuthUrl, buildDashboardUrl } from "./app-urls";

const originalEnv = { ...process.env };
afterEach(() => {
  process.env = { ...originalEnv };
});

test("production API uses its own origin while browser auth stays on the dashboard", () => {
  process.env.NODE_ENV = "production";
  delete process.env.NEXT_PUBLIC_API_URL;
  delete process.env.API_PUBLIC_URL;
  delete process.env.NEXT_PUBLIC_DASHBOARD_URL;
  delete process.env.DASHBOARD_PUBLIC_URL;
  delete process.env.DASHBOARD_ROOT_DOMAIN;
  expect(
    buildDashboardUrl({
      currentUrl: "https://afterservice.app",
      path: "/sign-up",
    }),
  ).toBe("https://dash.afterservice.app/sign-up");
  expect(
    buildApiUrl({
      currentUrl: "https://dash.afterservice.app",
      path: "/health",
    }),
  ).toBe("https://api.afterservice.app/health");
  expect(
    buildApiUrl({
      currentUrl: "https://afterservice.app",
      path: "/api/trpc/health",
    }),
  ).toBe("https://api.afterservice.app/api/trpc/health");
  expect(buildAuthUrl({ currentUrl: "https://api.afterservice.app" })).toBe(
    "https://dash.afterservice.app/api/auth",
  );
});

test("local Portless and localhost API URLs keep their own ports", () => {
  process.env.NODE_ENV = "development";
  expect(
    buildApiUrl({
      currentUrl: "http://app-afterservice.localhost:1355",
      path: "/health",
    }),
  ).toBe("http://api-afterservice.localhost:1355/health");
  expect(
    buildApiUrl({ currentUrl: "http://localhost:4101", path: "/health" }),
  ).toBe("http://localhost:4102/health");
});
