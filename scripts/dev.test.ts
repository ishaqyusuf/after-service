// @ts-expect-error Bun test types are not included by the root TypeScript config.
import { describe, expect, test } from "bun:test";
import {
  commandForOptions,
  envForMode,
  localDatabasePort,
  modeForCommand,
  parseArgs,
  validatePortOwner,
} from "./dev";

describe("dev script profile router", () => {
  test("defaults to local dev", () => {
    expect(parseArgs([])).toEqual({
      profile: "local",
      task: "dev:portless",
      passthroughArgs: [],
    });
  });

  test("supports prod without local prepare", () => {
    const options = parseArgs(["--prod", "-f", "website", "api"]);

    expect(commandForOptions(options)).toEqual([
      "bun",
      "--env-file=/dev/null",
      expect.stringContaining("local-infra-kit/bin/dev.ts"),
      "--profile",
      "afterservice",
      "--prod",
      "--filter",
      "@afterservice/website",
      "--filter",
      "@afterservice/api",
    ]);
  });

  test("defaults local dev to portless", () => {
    const options = parseArgs(["--f", "dashboard"]);

    expect(
      commandForOptions(options).some((part) =>
        part.includes("local-infra-kit/bin/dev.ts"),
      ),
    ).toBe(true);
    expect(commandForOptions(options)).toContain("@afterservice/dashboard");
  });

  test("maps shared local-infra modes and rejects conflicts", () => {
    expect(modeForCommand([])).toBe("local");
    expect(modeForCommand(["--dev"])).toBe("dev");
    expect(modeForCommand(["--preview"])).toBe("preview");
    expect(modeForCommand(["--prod"])).toBe("prod");
    expect(() => modeForCommand(["--preview", "--prod"])).toThrow(
      "Conflicting local-infra modes",
    );
  });

  test("uses the mode file as the authoritative database source", () => {
    const env = envForMode(
      "local",
      "/workspace",
      {
        DATABASE_URL: "postgresql://inherited.example.com/unsafe",
      },
      {
        DATABASE_URL:
          "postgresql://afterservice:afterservice@127.0.0.1:55433/afterservice",
      },
    );

    expect(env.DATABASE_URL).toBe(
      "postgresql://afterservice:afterservice@127.0.0.1:55433/afterservice",
    );
    expect(env.AFTERSERVICE_ENV_MODE).toBe("local");
    expect(localDatabasePort(env)).toBe(55433);
  });

  test("refuses a foreign process on the configured Postgres port", () => {
    expect(() => validatePortOwner(55433, true, "other-postgres")).toThrow(
      "other-postgres",
    );
    expect(() =>
      validatePortOwner(55433, true, "afterservice-postgres"),
    ).not.toThrow();
  });

  test("rejects removed portless flag", () => {
    expect(() => parseArgs(["--portless"])).toThrow(
      "Unknown dev flag: --portless",
    );
  });

  test("supports exact, bare, suffix-excluded, and repeated filter aliases", () => {
    expect(
      parseArgs(["--filter", "api", "-f", "jobs", "--f", "website!"]),
    ).toEqual({
      profile: "local",
      task: "dev:portless",
      filters: {
        targets: [
          "@afterservice/api",
          "@afterservice/jobs",
          "!@afterservice/website",
        ],
      },
      passthroughArgs: [],
    });
  });

  test("passes complex turbo selectors through without package validation", () => {
    expect(
      parseArgs(["-filter", "@afterservice/website...", "{apps/*}"]),
    ).toEqual({
      profile: "local",
      task: "dev:portless",
      filters: {
        targets: ["@afterservice/website...", "{apps/*}"],
      },
      passthroughArgs: [],
    });
  });

  test("passes turbo args after -- through", () => {
    const options = parseArgs(["-f", "api", "--", "--dry-run=json"]);

    expect(commandForOptions(options)).toContain("--dry-run=json");
  });

  test("lists valid packages when a filter target is missing", () => {
    expect(() => parseArgs(["-f", "marketing"])).toThrow(
      /Unknown dev filter package: marketing\nValid packages: .*@afterservice\/api.*@afterservice\/website/s,
    );
  });
});
