import { describe, expect, test } from "bun:test";
import { resolveEmailRecipients } from "./email";

describe("afterservice hybrid email routing", () => {
  test.each([
    "prod",
    "production",
  ])("%s defaults ordinary recipients to provider delivery", (mode) => {
    expect(
      resolveEmailRecipients("owner@example.com", {
        AFTERSERVICE_ENV_MODE: mode,
      }).routes[0]?.transport,
    ).toBe("provider");
  });

  test.each([
    "local",
    "development",
    "preview",
  ])("%s keeps ordinary recipients in console mode", (mode) => {
    expect(
      resolveEmailRecipients("owner@example.com", {
        AFTERSERVICE_ENV_MODE: mode,
        NODE_ENV: "production",
      }).routes[0]?.transport,
    ).toBe("console");
  });

  test("explicit console delivery still overrides a production profile", () => {
    expect(
      resolveEmailRecipients("owner@example.com", {
        AFTERSERVICE_ENV_MODE: "prod",
        EMAIL_DELIVERY_MODE: "console",
      }).routes[0]?.transport,
    ).toBe("console");
  });

  test("QA routing remains live in console mode", () => {
    const result = resolveEmailRecipients("owner@after.test", {
      EMAIL_DELIVERY_MODE: "console",
      EMAIL_QA_DOMAIN_ROUTES: '{"after.test":"tester@example.com"}',
    });
    expect(result.routes[0]).toEqual({
      originalRecipient: "owner@after.test",
      recipient: "tester@example.com",
      transport: "provider",
      qaRouted: true,
    });
  });

  test("ordinary recipients stay in console outside production", () => {
    const result = resolveEmailRecipients("owner@example.com", {
      EMAIL_DELIVERY_MODE: "console",
    });
    expect(result.routes[0]?.transport).toBe("console");
  });

  test("unmapped test recipients fail closed", () => {
    expect(() =>
      resolveEmailRecipients("owner@unknown.test", {
        EMAIL_QA_DOMAIN_ROUTES: '{"after.test":"tester@example.com"}',
      }),
    ).toThrow("No QA email route");
  });
});
