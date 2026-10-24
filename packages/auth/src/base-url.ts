type AuthEnvironment = Record<string, string | undefined>;

/** Shared by Better Auth and QA cookie signing/clearing. */
export function getAuthBaseUrl(env: AuthEnvironment = process.env) {
  const read = (name: string) => env[name]?.trim() || undefined;
  if (env.AFTERSERVICE_ENV_MODE === "local" || env.NODE_ENV !== "production") {
    return read("BETTER_AUTH_LOCAL_URL") ?? "http://localhost:4101";
  }
  return read("BETTER_AUTH_URL") ?? read("NEXT_PUBLIC_DASHBOARD_URL");
}
