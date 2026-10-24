import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import proxy from "./proxy";

test("a revoked session cookie cannot bounce reset completion away from sign-in", async () => {
  const response = await proxy(
    new NextRequest(
      "https://dash.afterservice.app/sign-in?password_reset=success",
      {
        headers: { cookie: "better-auth.session_token=revoked-session" },
      },
    ),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

test("anonymous password recovery and token landing pages never require sign-in", async () => {
  for (const path of [
    "/forgot-password",
    "/reset-password?token=synthetic-reset-token",
    "/en/forgot-password",
    "/en/reset-password?error=INVALID_TOKEN",
  ]) {
    const response = await proxy(
      new NextRequest(`https://dash.afterservice.app${path}`),
    );
    expect(response.headers.get("location")).toBeNull();
    expect(response.status).toBe(200);
    if (!path.startsWith("/en/")) {
      expect(response.headers.get("x-middleware-rewrite")).toContain("/en/");
    }
  }
});

test("recovery access does not expose protected pages or similarly named paths", async () => {
  for (const path of [
    "/customers",
    "/forgot-password-history",
    "/reset-password-admin",
  ]) {
    const response = await proxy(
      new NextRequest(`https://dash.afterservice.app${path}`),
    );
    const target = new URL(
      response.headers.get("location") ?? "https://invalid.test",
    );
    expect(target.pathname).toBe("/sign-in");
    expect(target.searchParams.get("return_to")).toBe(path);
  }
});
