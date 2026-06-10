import { prismaExtension } from "@trigger.dev/build/extensions/prisma";
import { defineConfig } from "@trigger.dev/sdk/v3";

function getTriggerProjectId() {
  const projectId = process.env.TRIGGER_PROJECT_ID;

  if (!projectId) {
    throw new Error("TRIGGER_PROJECT_ID is required to configure jobs.");
  }

  return projectId;
}

export default defineConfig({
  project: getTriggerProjectId(),
  runtime: "node",
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
      prismaExtension({
        directUrlEnvVarName: "DATABASE_URL",
        schema: "./src/schema.prisma",
        version: "^7.8.0",
      }),
    ],
  },
  dirs: ["./src/tasks"],
});
