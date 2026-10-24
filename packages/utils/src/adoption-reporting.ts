type ReportingEnvironment = Record<string, string | undefined>;

/** Reviewed internal/test IDs affect reporting only, never auth or purge eligibility. */
export function getAdoptionExcludedWorkspaceIds(env: ReportingEnvironment) {
  const configured = env.ADOPTION_EXCLUDED_WORKSPACE_IDS?.trim();
  if (!configured) return [];
  const ids = [
    ...new Set(
      configured
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
  if (
    !ids.length ||
    ids.length > 1000 ||
    ids.some((id) => !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id))
  ) {
    throw new Error("Adoption reporting exclusions are misconfigured.");
  }
  return ids;
}
