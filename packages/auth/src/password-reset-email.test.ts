import { afterEach, expect, spyOn, test } from "bun:test";
import { sendPasswordResetEmail } from "./password-reset-email";

const names = [
  "EMAIL_DELIVERY_MODE",
  "EMAIL_QA_DOMAIN_ROUTES",
  "RESEND_API_KEY",
] as const;
const original = Object.fromEntries(
  names.map((name) => [name, process.env[name]]),
);
let restoreFetch: (() => void) | undefined;

afterEach(() => {
  restoreFetch?.();
  for (const name of names) {
    const value = original[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("QA reset email uses only the configured mailbox and escapes the link", async () => {
  process.env.EMAIL_DELIVERY_MODE = "console";
  process.env.EMAIL_QA_DOMAIN_ROUTES = JSON.stringify({
    "afterservice.qa.test": "mailbox@example.com",
  });
  process.env.RESEND_API_KEY = "test-provider-key";
  let payload: Record<string, unknown> = {};
  const provider = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (
        _url: Parameters<typeof fetch>[0],
        init?: Parameters<typeof fetch>[1],
      ) => {
        payload = JSON.parse(String(init?.body));
        return Response.json({ id: "synthetic-message" });
      },
      { preconnect: fetch.preconnect },
    ),
  );
  restoreFetch = () => provider.mockRestore();
  await sendPasswordResetEmail({
    email: "reset@afterservice.qa.test",
    url: 'https://app.afterservice.invalid/reset?token=synthetic&callback="reset"',
  });
  expect(provider).toHaveBeenCalledTimes(1);
  expect(payload.to).toEqual(["mailbox@example.com"]);
  expect(payload.subject).toBe(
    "[QA: reset@afterservice.qa.test] Reset your password",
  );
  expect(payload.html).toContain("&amp;callback=&quot;reset&quot;");
});

test("provider rejection fails without exposing its body or reset token", async () => {
  process.env.EMAIL_DELIVERY_MODE = "live";
  process.env.EMAIL_QA_DOMAIN_ROUTES = "{}";
  process.env.RESEND_API_KEY = "test-provider-key";
  const provider = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("sensitive-provider-body", { status: 422 }),
  );
  restoreFetch = () => provider.mockRestore();
  await expect(
    sendPasswordResetEmail({
      email: "reset@example.com",
      url: "https://app.afterservice.invalid/reset?token=synthetic",
    }),
  ).rejects.toThrow("Password reset email delivery failed (422).");
});

test("console mode never sends or logs a reset token", async () => {
  process.env.EMAIL_DELIVERY_MODE = "console";
  process.env.EMAIL_QA_DOMAIN_ROUTES = "{}";
  const provider = spyOn(globalThis, "fetch");
  const logger = spyOn(console, "info").mockImplementation(() => {});
  restoreFetch = () => {
    provider.mockRestore();
    logger.mockRestore();
  };
  await sendPasswordResetEmail({
    email: "reset@example.com",
    url: "https://app.afterservice.invalid/reset?token=synthetic-secret",
  });
  expect(provider).not.toHaveBeenCalled();
  expect(JSON.stringify(logger.mock.calls)).not.toContain("synthetic-secret");
});
