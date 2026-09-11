import { describe, expect, test } from "bun:test";
import { signInSchema } from "./sign-in-schema";

describe("sign-in credentials", () => {
  test("accepts a non-empty legacy password for server verification", () => {
    expect(
      signInSchema.safeParse({
        email: "owner@example.com",
        password: "123456",
      }).success,
    ).toBe(true);
  });

  test("still rejects an empty password", () => {
    expect(
      signInSchema.safeParse({
        email: "owner@example.com",
        password: "",
      }).success,
    ).toBe(false);
  });
});
