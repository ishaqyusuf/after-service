#!/usr/bin/env bun

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadModeEnv } from "../../../local-infra-kit/src/env";

export type DevProfile = "local" | "dev" | "preview" | "prod";
type DevTask = "dev:portless";
type CommandEnv = Record<string, string | undefined>;

type DevFilterOptions = {
  targets: string[];
};

type DevCliOptions = {
  profile: DevProfile;
  task: DevTask;
  filters?: DevFilterOptions;
  passthroughArgs: string[];
};

const WORKSPACE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TOOLKIT_DEV = resolve(WORKSPACE_ROOT, "../../local-infra-kit/bin/dev.ts");
const PROFILE_FLAGS = new Map<string, DevProfile>([
  ["--local", "local"],
  ["--dev", "dev"],
  ["--preview", "preview"],
  ["--prod", "prod"],
]);
const FILTER_FLAGS = new Set(["--filter", "--f", "-f", "-filter"]);
const POSTGRES_CONTAINER = "afterservice-postgres";
const LOCAL_DATABASE_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0.0.0.0",
  "postgres",
]);

let cachedWorkspacePackages: string[] | undefined;

export function modeForCommand(args: string[]): DevProfile {
  const modes = new Set<DevProfile>();

  for (const arg of args) {
    if (arg === "--") break;
    const mode = PROFILE_FLAGS.get(arg);
    if (mode) modes.add(mode);
  }

  if (modes.size > 1) {
    throw new Error("Conflicting local-infra modes. Choose one mode.");
  }

  return [...modes][0] ?? "local";
}

export function parseArgs(argv: string[]): DevCliOptions {
  const profile = modeForCommand(argv);
  const task: DevTask = "dev:portless";
  let filters: DevFilterOptions | undefined;
  let passthroughArgs: string[] = [];
  let index = 0;

  while (index < argv.length) {
    const arg = argv[index];
    if (!arg) break;

    if (arg === "--") {
      passthroughArgs = argv.slice(index + 1);
      break;
    }

    if (PROFILE_FLAGS.has(arg)) {
      index += 1;
      continue;
    }

    if (FILTER_FLAGS.has(arg)) {
      const targets: string[] = [];
      index += 1;

      while (index < argv.length) {
        const target = argv[index];
        if (!target || isFlagBoundary(target)) break;
        targets.push(normalizeTurboFilter(target));
        index += 1;
      }

      if (targets.length === 0) {
        throw new Error(`Missing targets for ${arg}.`);
      }

      filters = { targets: [...(filters?.targets ?? []), ...targets] };
      continue;
    }

    throw new Error(
      `Unknown dev flag: ${arg}. Use --local, --dev, --preview, --prod, or --filter/--f/-f/-filter.`,
    );
  }

  if (filters) validateFilterTargets(filters.targets);
  return { profile, task, ...(filters ? { filters } : {}), passthroughArgs };
}

export function commandForOptions(options: DevCliOptions): string[] {
  return [
    "bun",
    "--env-file=/dev/null",
    TOOLKIT_DEV,
    "--profile",
    "afterservice",
    ...(options.profile === "local" ? [] : [`--${options.profile}`]),
    ...buildTurboFilterArgs(options.filters),
    ...(options.passthroughArgs.length
      ? ["--", ...options.passthroughArgs]
      : []),
  ];
}

export function envForMode(
  mode: DevProfile,
  workspaceRoot: string,
  processEnv: CommandEnv,
  explicitFileEnv?: CommandEnv,
) {
  const fileEnv =
    explicitFileEnv ?? loadModeEnv(workspaceRoot, mode, "afterservice");

  return {
    ...processEnv,
    ...fileEnv,
    AFTERSERVICE_DB_MODE: mode,
    AFTERSERVICE_ENV_MODE: mode,
    AFTERSERVICE_WORKSPACE_ROOT: workspaceRoot,
  };
}

export function localDatabasePort(env: CommandEnv) {
  const databaseUrl = env.AFTERSERVICE_DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Missing AFTERSERVICE_DATABASE_URL or DATABASE_URL for local mode. Check .env.local.",
    );
  }

  let url: URL;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("Invalid afterservice database URL for local mode.");
  }

  if (!LOCAL_DATABASE_HOSTS.has(url.hostname)) return undefined;
  const port = Number(url.port || "5432");

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      "Invalid local PostgreSQL port in the afterservice database URL.",
    );
  }

  return port;
}

export function validatePortOwner(
  postgresPort: number,
  occupied: boolean,
  owner: string | undefined,
) {
  if (!occupied || owner === POSTGRES_CONTAINER) return;

  throw new Error(
    [
      `Cannot start afterservice PostgreSQL: 127.0.0.1:${postgresPort} is owned by ${owner ?? "another process"}.`,
      "Choose a free port in .env.local or stop the owning service before retrying.",
    ].join("\n"),
  );
}

function normalizeTurboFilter(target: string): string {
  const prefixExcluded = target.startsWith("!");
  const suffixExcluded =
    target.endsWith("!") && target.length > 1 && !prefixExcluded;
  const inner = prefixExcluded
    ? target.slice(1)
    : suffixExcluded
      ? target.slice(0, -1)
      : target;
  const resolved = resolveBarePackageFilter(inner);
  return prefixExcluded || suffixExcluded ? `!${resolved}` : resolved;
}

function isFlagBoundary(target: string): boolean {
  return (
    target.startsWith("--") ||
    PROFILE_FLAGS.has(target) ||
    FILTER_FLAGS.has(target)
  );
}

function validateFilterTargets(targets: string[]) {
  const exactTargets = targets
    .map((target) => (target.startsWith("!") ? target.slice(1) : target))
    .filter(isExactPackageFilter);
  const validPackages = workspacePackages();
  const missing = exactTargets.filter(
    (target) => !validPackages.includes(target),
  );

  if (missing.length) {
    throw new Error(
      [
        `Unknown dev filter package${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}`,
        `Valid packages: ${validPackages.join(", ")}`,
      ].join("\n"),
    );
  }
}

function resolveBarePackageFilter(target: string): string {
  if (target.startsWith("@") || !isExactPackageFilter(target)) return target;
  const matches = workspacePackages().filter(
    (packageName) =>
      packageName === target || packageName.endsWith(`/${target}`),
  );
  if (matches.length === 1 && matches[0]) return matches[0];
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous dev filter package: ${target}. Matches: ${matches.join(", ")}`,
    );
  }
  return target;
}

function isExactPackageFilter(target: string): boolean {
  return (
    target.length > 0 &&
    !target.startsWith(".") &&
    !target.includes("*") &&
    !target.includes("...") &&
    !target.includes("^") &&
    !target.includes("{") &&
    !target.includes("[")
  );
}

function workspacePackages(): string[] {
  cachedWorkspacePackages ??= readWorkspacePackages();
  return cachedWorkspacePackages;
}

function readWorkspacePackages(): string[] {
  const packageJson = JSON.parse(
    readFileSync(resolve(WORKSPACE_ROOT, "package.json"), "utf8"),
  ) as { workspaces?: unknown };
  const workspaces = Array.isArray(packageJson.workspaces)
    ? packageJson.workspaces.filter(
        (workspace): workspace is string => typeof workspace === "string",
      )
    : [];
  const names = new Set<string>();

  for (const workspace of workspaces) {
    if (workspace.startsWith("!")) continue;
    for (const directory of expandWorkspace(workspace)) {
      const manifest = resolve(directory, "package.json");
      if (!existsSync(manifest)) continue;
      const parsed = JSON.parse(readFileSync(manifest, "utf8")) as {
        name?: unknown;
      };
      if (typeof parsed.name === "string") names.add(parsed.name);
    }
  }

  return [...names].sort();
}

function expandWorkspace(workspace: string): string[] {
  if (!workspace.endsWith("/*")) return [resolve(WORKSPACE_ROOT, workspace)];
  const parent = resolve(WORKSPACE_ROOT, workspace.slice(0, -2));
  if (!existsSync(parent)) return [];
  return readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(parent, entry.name));
}

function buildTurboFilterArgs(filters?: DevFilterOptions): string[] {
  return filters?.targets.flatMap((target) => ["--filter", target]) ?? [];
}

async function portIsOccupied(port: number) {
  return await new Promise<boolean>((resolvePromise, reject) => {
    const server = createServer();
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") return resolvePromise(true);
      reject(error);
    });
    server.listen(port, "127.0.0.1", () => {
      server.close((error) => (error ? reject(error) : resolvePromise(false)));
    });
  });
}

function dockerContainerOwningPort(port: number) {
  const result = Bun.spawnSync(
    ["docker", "ps", "--format", "{{.Names}}\t{{.Ports}}"],
    { stderr: "ignore", stdout: "pipe" },
  );
  if (result.exitCode !== 0) return undefined;

  for (const line of result.stdout.toString().split(/\r?\n/)) {
    const [name, ports = ""] = line.split("\t");
    if (name && ports.includes(`:${port}->`)) return name;
  }
  return undefined;
}

async function main() {
  const options = parseArgs(Bun.argv.slice(2));

  if (options.profile === "local") {
    const env = envForMode("local", WORKSPACE_ROOT, process.env);
    const port = localDatabasePort(env);
    if (port !== undefined) {
      validatePortOwner(
        port,
        await portIsOccupied(port),
        dockerContainerOwningPort(port),
      );
    }
  }

  const child = Bun.spawn(commandForOptions(options), {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  process.exit(await child.exited);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
