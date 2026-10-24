import { expect, test } from "bun:test";
import { getAdoptionExcludedWorkspaceIds } from "./adoption-reporting";

test("reporting exclusions use exact, deduplicated workspace IDs", () => {
  expect(getAdoptionExcludedWorkspaceIds({})).toEqual([]);
  expect(
    getAdoptionExcludedWorkspaceIds({
      ADOPTION_EXCLUDED_WORKSPACE_IDS:
        "internal-one, internal-two,internal-one",
    }),
  ).toEqual(["internal-one", "internal-two"]);
});

test("malformed reporting config fails instead of broadening adoption counts", () => {
  for (const value of [
    ",",
    "*",
    "internal-one; SELECT",
    "x".repeat(129),
    Array.from({ length: 1001 }, (_, index) => `workspace-${index}`).join(","),
  ]) {
    expect(() =>
      getAdoptionExcludedWorkspaceIds({
        ADOPTION_EXCLUDED_WORKSPACE_IDS: value,
      }),
    ).toThrow("Adoption reporting exclusions are misconfigured.");
  }
});
