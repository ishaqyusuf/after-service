import { defineConfig, devices } from "@playwright/test";
import {
  assertLocalTestDatabase,
  localBrowserUrl,
} from "./tests/support/local-env";

assertLocalTestDatabase();
const dashboardUrl = localBrowserUrl(
  process.env.E2E_DASHBOARD_URL ?? "https://app-afterservice.localhost",
  "app-afterservice.localhost",
);
const websiteUrl = localBrowserUrl(
  process.env.E2E_WEBSITE_URL ?? "https://afterservice.localhost",
  "afterservice.localhost",
);

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.pw.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: "test-results",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: dashboardUrl,
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "bun run dev --local --filter dashboard website",
    url: `${dashboardUrl}/sign-in`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    ignoreHTTPSErrors: true,
  },
  metadata: { websiteUrl },
});
