import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";
import triggerProject from "./trigger-project.json";

const syncedProductionEnvVars = [
  "AFTERSERVICE_ENV_MODE",
  "EMAIL_FROM_ADDRESS",
  "LOGLY_COLLECTOR_URL",
  "LOGLY_PROJECT",
  "EMAIL_DELIVERY_MODE",
  "EMAIL_QA_DOMAIN_ROUTES",
] as const;

// Credentials are provisioned as Trigger secrets. The older CLI sync API
// defaults to revealable values, so routine deploys must not overwrite them.

function getSyncedProductionEnv() {
  return Object.fromEntries(
    syncedProductionEnvVars.flatMap((key) => {
      const value = process.env[key]?.trim();
      return value ? [[key, value]] : [];
    }),
  );
}

export default defineConfig({
  project: triggerProject.projectId,
  runtime: "node-22",
  logLevel: "log",
  maxDuration: 60,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [
      syncEnvVars(() => getSyncedProductionEnv(), { override: true }),
      prismaExtension({
        directUrlEnvVarName: "DATABASE_URL",
        schema: "./src/schema.prisma",
        version: "^7.8.0",
      }),
    ],
  },
  dirs: ["./src/tasks"],
});
