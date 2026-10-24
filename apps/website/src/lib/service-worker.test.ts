import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(
  new URL("../../public/sw.js", import.meta.url),
  "utf8",
);

function requestAsset(hostname: string, path: string) {
  const cached = new Response("cached asset");
  const handlers = new Map<string, (event: unknown) => void>();
  let response: Promise<Response> | undefined;

  runInNewContext(source, {
    Request,
    Response,
    URL,
    caches: { open: async () => ({ match: async () => cached }) },
    fetch: () => {
      throw new Error("This request should not fetch through the worker");
    },
    self: {
      location: { hostname, origin: `https://${hostname}` },
      addEventListener: (name: string, handler: (event: unknown) => void) =>
        handlers.set(name, handler),
    },
  });

  handlers.get("fetch")?.({
    request: new Request(`https://${hostname}${path}`),
    respondWith: (result: Promise<Response>) => {
      response = result;
    },
  });

  return response;
}

test("local Next chunks bypass the service worker so edits cannot reuse stale CSS", () => {
  expect(
    requestAsset("afterservice.localhost", "/_next/static/dev.css"),
  ).toBeUndefined();
  expect(requestAsset("localhost", "/_next/static/dev.js")).toBeUndefined();
});

test("local install icons retain the offline asset cache", async () => {
  expect(
    await (
      await requestAsset("afterservice.localhost", "/icons/icon-192.png")
    )?.text(),
  ).toBe("cached asset");
});

test("production hashed chunks retain the offline asset cache", async () => {
  expect(
    await (
      await requestAsset("afterservice.app", "/_next/static/abc123.css")
    )?.text(),
  ).toBe("cached asset");
});
