import { describe, expect, test } from "bun:test";
import { getTrustedQaNetworkSource } from "./qa-network-source";

describe("trusted QA network source", () => {
  test("ignores forwarding headers unless the deployment opts in", () => {
    expect(
      getTrustedQaNetworkSource({ env: {}, getHeader: () => "203.0.113.9" }),
    ).toBeNull();
  });

  test("reads an allowlisted proxy-sanitized header", () => {
    expect(
      getTrustedQaNetworkSource({
        env: { QA_ACCELERATOR_TRUSTED_CLIENT_IP_HEADER: "cf-connecting-ip" },
        getHeader: (name) =>
          name === "cf-connecting-ip" ? "203.0.113.9" : null,
      }),
    ).toBe("203.0.113.9");
  });

  for (const headerName of [
    "x-forwarded-for",
    "authorization",
    "x-client-ip",
  ]) {
    test(`rejects unapproved header ${headerName}`, () => {
      expect(
        getTrustedQaNetworkSource({
          env: { QA_ACCELERATOR_TRUSTED_CLIENT_IP_HEADER: headerName },
          getHeader: () => "203.0.113.9",
        }),
      ).toBeNull();
    });
  }

  test("rejects a proxy chain", () => {
    expect(
      getTrustedQaNetworkSource({
        env: { QA_ACCELERATOR_TRUSTED_CLIENT_IP_HEADER: "x-real-ip" },
        getHeader: () => "203.0.113.9, 198.51.100.2",
      }),
    ).toBeNull();
  });
});
