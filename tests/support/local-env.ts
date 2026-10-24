export function assertLocalTestDatabase() {
  const url = new URL(process.env.DATABASE_URL ?? "file:///missing");
  if (
    process.env.AFTERSERVICE_ENV_MODE !== "local" ||
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  ) {
    throw new Error(
      "Integration/browser tests require the local profile and a loopback PostgreSQL database.",
    );
  }
}
