import { createPolar } from "@polar-sh/sdk/2026-10";

export function getPolarEnvironment(): "sandbox" | "production" {
  const environment = process.env.POLAR_ENVIRONMENT;
  if (environment !== undefined) {
    if (environment !== "production" && environment !== "sandbox") {
      throw new Error("POLAR_ENVIRONMENT must be sandbox or production");
    }
    return environment;
  }
  return process.env.NODE_ENV === "production" ? "production" : "sandbox";
}

export function getPolarClient() {
  const environment = getPolarEnvironment();
  const accessToken =
    environment === "sandbox"
      ? process.env.POLAR_SANDBOX_ACCESS_TOKEN
      : process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error(`Polar ${environment} credentials are not configured`);
  return createPolar({ accessToken, environment });
}

export function getPolarBillingConfig() {
  const environment = getPolarEnvironment();
  const prefix = environment === "sandbox" ? "POLAR_SANDBOX" : "POLAR";
  const accessToken = process.env[`${prefix}_ACCESS_TOKEN`];
  const organizationId = process.env[`${prefix}_ORGANIZATION_ID`];
  const productId = process.env[`${prefix}_BUSINESS_MONTHLY_PRODUCT_ID`];
  const webhookSecret = process.env[`${prefix}_WEBHOOK_SECRET`];
  if (!accessToken || !organizationId || !productId || !webhookSecret)
    throw new Error("Polar billing configuration is incomplete");
  return { environment, organizationId, productId, webhookSecret };
}

export function isPolarBillingConfigured() {
  try {
    getPolarBillingConfig();
    return true;
  } catch {
    return false;
  }
}
