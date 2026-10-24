import { expect, test } from "bun:test";
import {
  clearOnboardingDraft,
  type OnboardingDraftStorage,
  readOnboardingDraft,
  saveOnboardingDraft,
} from "./onboarding-draft";

function storage(): OnboardingDraftStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}
const values = {
  businessName: "Workshop draft",
  businessType: "Appliance repair company",
  serviceCategory: "Refrigerator repair",
  defaultFollowUpDelayDays: 14,
};

test("draft survives reauthentication in the same tab and is isolated by account", () => {
  const tab = storage();
  expect(saveOnboardingDraft(tab, "operator-1", values, 1000)).toBe(true);
  expect(readOnboardingDraft(tab, "operator-1", 2000)).toEqual(values);
  expect(readOnboardingDraft(tab, "operator-2", 2000)).toBeNull();
  clearOnboardingDraft(tab, "operator-1");
  expect(readOnboardingDraft(tab, "operator-1", 2000)).toBeNull();
});

test("expired drafts are removed and unfinished business names can be recovered", () => {
  const tab = storage();
  expect(
    saveOnboardingDraft(
      tab,
      "operator-1",
      { ...values, businessName: "" },
      1000,
    ),
  ).toBe(true);
  expect(readOnboardingDraft(tab, "operator-1", 2000)?.businessName).toBe("");
  expect(
    readOnboardingDraft(tab, "operator-1", 1000 + 24 * 60 * 60 * 1000),
  ).toBeNull();
});

test("blocked storage never prevents business setup", () => {
  const blocked = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
    removeItem: () => {
      throw new Error("SecurityError");
    },
  };
  expect(readOnboardingDraft(blocked, "operator-1")).toBeNull();
  expect(saveOnboardingDraft(blocked, "operator-1", values)).toBe(false);
  expect(() => clearOnboardingDraft(blocked, "operator-1")).not.toThrow();
  expect(saveOnboardingDraft(null, "operator-1", values)).toBe(false);
});

test("drafts allow only setup fields and reject malformed values", () => {
  let persisted = "";
  const tab = {
    ...storage(),
    setItem: (_key: string, value: string) => {
      persisted = value;
    },
  };
  saveOnboardingDraft(tab, "operator-1", {
    ...values,
    password: "must-not-be-stored",
  });
  expect(persisted).not.toContain("password");
  expect(persisted).not.toContain("must-not-be-stored");
  expect(
    saveOnboardingDraft(tab, "operator-1", {
      ...values,
      defaultFollowUpDelayDays: -1,
    }),
  ).toBe(false);
  const invalid = { ...tab, getItem: () => "{invalid json" };
  expect(readOnboardingDraft(invalid, "operator-1")).toBeNull();
});
