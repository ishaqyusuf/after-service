import { expect, test } from "bun:test";
import { submitOnboarding } from "./onboarding-request";

const values = { businessName: "Repair Workshop", defaultFollowUpDelayDays: 7 };

test("network rejection is converted into a retryable error", async () => {
  const result = await submitOnboarding(values, async () => {
    throw new TypeError("Failed to fetch");
  });
  expect(result.status).toBe("error");
  if (result.status === "error") expect(result.message).toContain("connection");
});

test("a pending request times out and aborts without rejecting the form handler", async () => {
  let aborted = false;
  const result = await submitOnboarding(
    values,
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("Aborted", "AbortError"));
        });
      }),
    5,
  );
  expect(aborted).toBe(true);
  expect(result.status).toBe("error");
  if (result.status === "error") expect(result.message).toContain("longer");
});

test("expired sessions are distinguished from other failures", async () => {
  expect(
    await submitOnboarding(
      values,
      async () => new Response(null, { status: 401 }),
    ),
  ).toEqual({ status: "unauthorized" });
});

test("validation feedback is retained but server internals are never displayed", async () => {
  const validation = await submitOnboarding(values, async () =>
    Response.json({ error: "Business name is required" }, { status: 400 }),
  );
  expect(validation).toEqual({
    status: "error",
    message: "Business name is required",
  });
  const failed = await submitOnboarding(values, async () =>
    Response.json(
      { error: "private database connection details" },
      { status: 500 },
    ),
  );
  expect(failed.status).toBe("error");
  expect(JSON.stringify(failed)).not.toContain("private database");
});

test("non-JSON failures remain readable and success sends credentials without automatic retries", async () => {
  const failed = await submitOnboarding(
    values,
    async () => new Response("Bad gateway", { status: 502 }),
  );
  expect(failed.status).toBe("error");
  let calls = 0;
  const successful = await submitOnboarding(values, async (url, options) => {
    calls++;
    expect(url).toBe("/api/onboarding");
    expect(options?.credentials).toBe("include");
    expect(JSON.parse(String(options?.body))).toEqual(values);
    return Response.json({ ok: true });
  });
  expect(successful).toEqual({ status: "success" });
  expect(calls).toBe(1);
});
