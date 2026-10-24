import { afterEach, expect, spyOn, test } from "bun:test";
import * as database from "@afterservice/db";
import app from "./oversight";

const original = {
  OVERSIGHT_ENABLED: process.env.OVERSIGHT_ENABLED,
  OVERSIGHT_READ_KEY: process.env.OVERSIGHT_READ_KEY,
};
const key = "oversight-test-credential-32-characters";
afterEach(() => {
  for (const [name, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("Oversight rejects disabled, weak and invalid credentials before database access", async () => {
  const db = spyOn(database, "getOversightDbClient").mockImplementation(() => {
    throw new Error("Database must not initialize");
  });
  try {
    for (const path of ["/summary", "/businesses", "/users", "/records"]) {
      process.env.OVERSIGHT_ENABLED = "false";
      process.env.OVERSIGHT_READ_KEY = key;
      expect((await app.request(path)).status).toBe(503);
      process.env.OVERSIGHT_ENABLED = "true";
      process.env.OVERSIGHT_READ_KEY = "weak";
      expect((await app.request(path)).status).toBe(503);
      process.env.OVERSIGHT_READ_KEY = key;
      for (const authorization of [
        undefined,
        "Bearer wrong",
        "Bearer é".repeat(30),
      ]) {
        const response = await app.request(path, {
          headers: authorization ? { authorization } : {},
        });
        expect(response.status).toBe(401);
        expect(response.headers.get("cache-control")).toBe("no-store");
      }
    }
    expect(db).not.toHaveBeenCalled();
  } finally {
    db.mockRestore();
  }
});

test("Oversight validates periods and directory inputs before database access", async () => {
  process.env.OVERSIGHT_ENABLED = "true";
  process.env.OVERSIGHT_READ_KEY = key;
  const db = spyOn(database, "getOversightDbClient");
  try {
    for (const path of [
      "/summary?days=1",
      "/summary?days=7&workspaceId=x",
      "/users?cursor=",
      `/records?search=${"a".repeat(201)}`,
      "/businesses?limit=1000",
    ]) {
      expect(
        (
          await app.request(path, {
            headers: { authorization: `Bearer ${key}` },
          })
        ).status,
      ).toBe(400);
    }
    expect(db).not.toHaveBeenCalled();
  } finally {
    db.mockRestore();
  }
});

test("Oversight sanitizes unavailable database errors and never advertises zero data", async () => {
  process.env.OVERSIGHT_ENABLED = "true";
  process.env.OVERSIGHT_READ_KEY = key;
  const db = spyOn(database, "getOversightDbClient").mockImplementation(() => {
    throw new Error("private-database-password");
  });
  try {
    const response = await app.request("/summary?days=7", {
      headers: { authorization: `Bearer ${key}` },
    });
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      error: "Afterservice operational data is unavailable",
    });
  } finally {
    db.mockRestore();
  }
});
