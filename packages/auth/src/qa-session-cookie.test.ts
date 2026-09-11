import { describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import {
  clearBetterAuthSessionCookieHeaders,
  createBetterAuthSessionCookieHeaders,
} from "./qa-session-cookie";

describe("QA-derived Better Auth session cookies", () => {
  test("uses Better Call's signed-cookie wire format", () => {
    const env = {
      BETTER_AUTH_SECRET: "test-secret-long-enough-for-cookie-signing",
      BETTER_AUTH_URL: "http://localhost:4101",
    };
    const [sessionCookie, cacheCookie] = createBetterAuthSessionCookieHeaders(
      {
        expiresAt: new Date(Date.now() + 60_000),
        token: "ordinary-session-token",
      },
      env,
    );
    const encodedValue = sessionCookie
      ?.split(";", 1)[0]
      ?.split("=")
      .slice(1)
      .join("=");
    const signedValue = decodeURIComponent(encodedValue ?? "");
    const expectedSignature = createHmac("sha256", env.BETTER_AUTH_SECRET)
      .update("ordinary-session-token")
      .digest("base64");

    expect(sessionCookie).toContain("better-auth.session_token=");
    expect(signedValue).toBe(`ordinary-session-token.${expectedSignature}`);
    expect(sessionCookie).toContain("HttpOnly");
    expect(sessionCookie).toContain("SameSite=Lax");
    expect(cacheCookie).toContain("better-auth.session_data=");
    expect(cacheCookie).toContain("Max-Age=0");
  });

  test("clears both secure session token and cookie cache", () => {
    const headers = clearBetterAuthSessionCookieHeaders({
      BETTER_AUTH_URL: "https://preview.afterservice.app",
    });

    expect(headers).toHaveLength(2);
    expect(headers.every((header) => header.includes("Max-Age=0"))).toBe(true);
    expect(headers.every((header) => header.includes("Secure"))).toBe(true);
  });
});
