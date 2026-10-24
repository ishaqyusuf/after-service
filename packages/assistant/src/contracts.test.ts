import { expect, test } from "bun:test";
import {
  actionSchema,
  amountToCents,
  capabilities,
  statedTimeToIso,
} from "./index";

test("every supported action has exactly one canonical capability", () => {
  expect(actionSchema.options.map((v) => v.shape.action.value).sort()).toEqual(
    Object.keys(capabilities).sort(),
  );
  expect(
    new Set(Object.values(capabilities).map((v) => v.procedure)).size,
  ).toBe(Object.keys(capabilities).length);
});
test("money is converted exactly and bounded to canonical cents", () => {
  expect(amountToCents("25000.01")).toBe(2500001);
  expect(amountToCents("0")).toBe(0);
  expect(amountToCents("0.29")).toBe(29);
  for (const value of ["1.001", "1e4", "-2", "NaN", "21474836.48"])
    expect(() => amountToCents(value)).toThrow();
});
test("local times respect timezone and reject nonexistent or ambiguous DST times", () => {
  expect(statedTimeToIso("2026-10-30T09:00", "Africa/Lagos")).toBe(
    "2026-10-30T08:00:00.000Z",
  );
  expect(() => statedTimeToIso("2026-03-08T02:30", "America/New_York")).toThrow(
    "does not exist",
  );
  expect(() => statedTimeToIso("2026-11-01T01:30", "America/New_York")).toThrow(
    "occurs twice",
  );
  expect(statedTimeToIso("2026-11-01T01:30-04:00", "America/New_York")).toBe(
    "2026-11-01T05:30:00.000Z",
  );
  expect(() => statedTimeToIso("2026-02-30T10:00", "UTC")).toThrow();
  expect(() => statedTimeToIso("tomorrow", "UTC")).toThrow();
});
test("draft schemas reject extra authority and unsupported actions", () => {
  expect(
    actionSchema.safeParse({
      action: "customer.create",
      input: { name: "Ada", workspaceId: "foreign" },
    }).success,
  ).toBe(false);
  expect(
    actionSchema.safeParse({ action: "email.send", input: {} }).success,
  ).toBe(false);
  expect(
    actionSchema.safeParse({
      action: "job.create",
      input: {
        customerId: "x",
        title: "Repair",
        completedAt: "2026-10-30T09:00",
        amount: "25000.00",
        currency: "NGN",
      },
    }).success,
  ).toBe(true);
});

test("offset timestamps cannot normalize invalid calendar dates", () => {
  expect(() =>
    statedTimeToIso("2026-02-30T10:00+01:00", "Africa/Lagos"),
  ).toThrow();
});
