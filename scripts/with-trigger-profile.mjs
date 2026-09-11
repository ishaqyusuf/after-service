#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const triggerTaskEnvKeys = [
  "AFTERSERVICE_ENV_MODE",
  "DATABASE_URL",
  "EMAIL_DELIVERY_MODE",
  "EMAIL_FROM_ADDRESS",
  "EMAIL_QA_DOMAIN_ROUTES",
  "LOGLY_COLLECTOR_URL",
  "LOGLY_ENABLED",
  "LOGLY_PROJECT",
  "LOGLY_PROJECT_KEY",
  "LOGLY_READ_KEY",
  "LOGLY_SERVER_KEY",
  "POLAR_ACCESS_TOKEN",
  "QA_MAINTENANCE_SECRET",
  "RESEND_API_KEY",
];

function dotenvLine(key, value) {
  for (const quote of ["'", '"', "`"]) {
    if (!value.includes(quote)) return `${key}=${quote}${value}${quote}`;
  }

  throw new Error(
    `${key} cannot be represented safely in the temporary Trigger.dev env file.`,
  );
}

const args = process.argv.slice(2);
const command = args[0] === "--" ? args.slice(1) : args;
const profile = process.env.TRIGGER_PROFILE?.trim();

if (command.length === 0) {
  console.error("Usage: with-trigger-profile.mjs -- <command> [args...]");
  process.exit(1);
}

const hasProfileFlag = command.some(
  (arg) => arg === "--profile" || arg.startsWith("--profile="),
);
let finalCommand =
  profile && !hasProfileFlag ? [...command, "--profile", profile] : command;

if (
  finalCommand[0] === "trigger" &&
  (finalCommand[1] === "deploy" || finalCommand[1] === "dev") &&
  !process.env.TRIGGER_PROJECT_ID?.trim()
) {
  console.error("TRIGGER_PROJECT_ID is required to configure jobs.");
  process.exit(1);
}

let temporaryEnvDirectory;

if (
  finalCommand[0] === "trigger" &&
  finalCommand[1] === "dev" &&
  !finalCommand.some(
    (arg) => arg === "--env-file" || arg.startsWith("--env-file="),
  )
) {
  temporaryEnvDirectory = mkdtempSync(join(tmpdir(), "afterservice-trigger-"));
  const envFile = join(temporaryEnvDirectory, "local.env");
  const contents = triggerTaskEnvKeys.flatMap((key) => {
    const value = process.env[key];
    return value ? [dotenvLine(key, value)] : [];
  });

  writeFileSync(envFile, `${contents.join("\n")}\n`, { mode: 0o600 });
  finalCommand = [...finalCommand, "--env-file", envFile];
}

function cleanUpTemporaryEnv() {
  if (!temporaryEnvDirectory) return;
  rmSync(temporaryEnvDirectory, { force: true, recursive: true });
  temporaryEnvDirectory = undefined;
}

const commandBin =
  finalCommand[0] === "trigger"
    ? join(process.cwd(), "node_modules", ".bin", "trigger")
    : finalCommand[0];
const executable = existsSync(commandBin) ? commandBin : finalCommand[0];

const child = spawn(executable, finalCommand.slice(1), {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

process.once("exit", cleanUpTemporaryEnv);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    cleanUpTemporaryEnv();
    child.kill(signal);
    process.exitCode = signal === "SIGINT" ? 130 : 143;
  });
}

child.on("exit", (code, signal) => {
  cleanUpTemporaryEnv();
  if (signal) {
    process.exitCode = signal === "SIGINT" ? 130 : 143;
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  cleanUpTemporaryEnv();
  console.error(error.message);
  process.exit(1);
});
