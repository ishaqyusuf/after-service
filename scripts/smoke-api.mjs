import assert from "node:assert/strict";

export async function smokeApi(origin, request = fetch) {
  const results = [];

  async function check(path, options, verify) {
    const response = await request(new Request(new URL(path, origin), options));
    await verify(response);
    results.push(`${options?.method ?? "GET"} ${path}: ${response.status}`);
  }

  await check("/health", undefined, async (response) => {
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, "afterservice-api");
  });

  for (const path of ["/trpc/health", "/api/trpc/health"]) {
    await check(path, undefined, async (response) => {
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.result.data.json.ok, true);
    });
  }

  await check("/api/auth/get-session", undefined, async (response) => {
    assert.equal(response.status, 200);
    assert.equal(await response.json(), null);
  });

  await check("/api/onboarding", { method: "POST" }, (response) => {
    assert.equal(response.status, 401);
  });

  await check("/api/trpc/workspace.getCurrent", undefined, (response) => {
    assert.equal(response.status, 401);
  });

  for (const path of [
    "/api/jobs/follow-ups/dry-run",
    "/webhooks/lemon-squeezy",
  ]) {
    await check(path, { method: "POST", body: "{}" }, (response) => {
      assert.ok([401, 503].includes(response.status));
    });
  }

  await check("/api/jobs/follow-ups/mark-missed", undefined, (response) => {
    assert.ok([401, 503].includes(response.status));
    assert.equal(response.headers.get("cache-control"), "no-store");
  });

  const trustedOrigin = "https://dash.afterservice.app";
  for (const path of ["/trpc/health", "/api/trpc/health"]) {
    await check(
      path,
      {
        method: "OPTIONS",
        headers: {
          Origin: trustedOrigin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      },
      (response) => {
        assert.equal(response.status, 204);
        assert.equal(
          response.headers.get("access-control-allow-origin"),
          trustedOrigin,
        );
        assert.equal(
          response.headers.get("access-control-allow-credentials"),
          "true",
        );
      },
    );
  }

  await check(
    "/api/trpc/health",
    { method: "OPTIONS", headers: { Origin: "https://untrusted.example" } },
    (response) => {
      assert.equal(response.headers.get("access-control-allow-origin"), null);
    },
  );

  await check("/api/qa-access/capability", undefined, (response) => {
    assert.equal(response.status, 404);
  });

  return results;
}

if (import.meta.main) {
  const origin = process.argv[2] ?? "https://api.afterservice.app";
  for (const result of await smokeApi(origin)) console.log(result);
  console.log("API smoke passed (no authenticated mutations).");
}
