import { defineConfig, devices } from "@playwright/test";
import {
  assertLocalTestDatabase,
  localBrowserUrl,
} from "./tests/support/local-env";

assertLocalTestDatabase();
if (new URL(process.env.DATABASE_URL!).pathname !== "/afterservice_assistant")
  throw Error(
    "Assistant browser tests require the isolated afterservice_assistant database.",
  );
const baseURL = localBrowserUrl(
  process.env.E2E_DASHBOARD_URL ?? "https://assistant-afterservice.localhost",
  "assistant-afterservice.localhost",
);
const env = {
  AFTERSERVICE_ASSISTANT_ENABLED: "true",
  ASSISTANT_AI_PROVIDER: "openai",
  ASSISTANT_AI_MODEL: "gpt-4.1-mini",
  ASSISTANT_OPENAI_API_KEY: "assistant-rehearsal-only",
  BETTER_AUTH_URL: baseURL,
  AUTH_TRUSTED_ORIGINS: baseURL,
  BETTER_AUTH_TRUSTED_ORIGINS: baseURL,
  LOGLY_ENABLED: "false",
};
export default defineConfig({
  testDir: "./tests/assistant-e2e",
  testMatch: "**/*.pw.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90000,
  expect: { timeout: 20000 },
  outputDir: "test-results/assistant",
  reporter: [["list"]],
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "assistant-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "assistant-mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command:
        "portless assistant-afterservice bun node_modules/next/dist/bin/next dev apps/dashboard --turbopack",
      url: `${baseURL}/sign-in`,
      ignoreHTTPSErrors: true,
      reuseExistingServer: false,
      timeout: 180000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
      env,
    },
    {
      command: "bun tests/support/assistant-rehearsal-server.ts",
      url: "http://127.0.0.1:4199/health",
      reuseExistingServer: false,
      timeout: 60000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
      env,
    },
  ],
});
