import { expect, test } from "bun:test";
import { getSafeReturnTo } from "./return-to";

test.each([
  undefined,
  null,
  "",
  "https://evil.example",
  "//evil.example",
  "/\\evil.example",
  "/\n/evil.example",
  " /customers",
])("rejects unsafe auth destination %j", (value) => {
  expect(getSafeReturnTo(value)).toBe("/");
});

test("preserves a relative destination, query, and fragment", () => {
  expect(getSafeReturnTo("/customers?q=Amina#details")).toBe(
    "/customers?q=Amina#details",
  );
});
