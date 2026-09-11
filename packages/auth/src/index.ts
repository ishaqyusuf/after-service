import { getDbClient } from "@afterservice/db";
import {
  assertQaAcceleratorStartupSafety,
  getDevAppUrlStrings,
  resolveEmailRecipients,
} from "@afterservice/utils";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

export {
  clearBetterAuthSessionCookieHeaders,
  createBetterAuthSessionCookieHeaders,
} from "./qa-session-cookie";

function unique(values: Array<string | undefined>) {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

assertQaAcceleratorStartupSafety(process.env);

function readNonEmptyEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export const authRoutes = {
  dashboardHome: "/",
  onboarding: "/onboarding",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const localAuthOrigins = [
  "http://localhost:4100",
  "http://localhost:4101",
  "http://127.0.0.1:4100",
  "http://127.0.0.1:4101",
] as const;

export const portlessAuthOrigins = [
  "http://afterservice.localhost:1355",
  "http://app-afterservice.localhost:1355",
] as const;

export function getTrustedOrigins() {
  const urls = getDevAppUrlStrings();

  return unique(
    [
      urls.site,
      urls.dashboard,
      ...localAuthOrigins,
      ...portlessAuthOrigins,
      process.env.BETTER_AUTH_TRUSTED_ORIGINS,
      process.env.AUTH_TRUSTED_ORIGINS,
    ].flatMap((value) =>
      value?.split(",").map((origin: string) => origin.trim()),
    ),
  );
}

export function getAuthBaseUrl() {
  const isLocalRuntime =
    process.env.AFTERSERVICE_ENV_MODE === "local" ||
    process.env.NODE_ENV !== "production";
  const devUrls = isLocalRuntime ? "http://localhost:4101" : undefined;

  if (devUrls) {
    return readNonEmptyEnv("BETTER_AUTH_LOCAL_URL") ?? devUrls;
  }

  return (
    readNonEmptyEnv("BETTER_AUTH_URL") ??
    readNonEmptyEnv("NEXT_PUBLIC_DASHBOARD_URL") ??
    undefined
  );
}

function getAuthSecret() {
  return (
    readNonEmptyEnv("BETTER_AUTH_SECRET") ??
    readNonEmptyEnv("AUTH_SECRET") ??
    (process.env.NEXT_PHASE === "phase-production-build"
      ? "afterservice-local-production-build-secret-placeholder"
      : undefined) ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "afterservice-local-development-secret")
  );
}

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: getAuthBaseUrl(),
  database: prismaAdapter(getDbClient(), {
    provider: "postgresql",
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const resendApiKey = readNonEmptyEnv("RESEND_API_KEY");
      const recipientResolution = resolveEmailRecipients(user.email);
      const [route] = recipientResolution.routes;
      if (!route) throw new Error("At least one email recipient is required.");
      if (route.transport === "console") {
        console.log(`[PASSWORD RESET] Send this link to ${user.email}: ${url}`);
        return;
      }
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is required for provider delivery.");
      }

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            readNonEmptyEnv("EMAIL_FROM_ADDRESS") ?? "noreply@afterservice.app",
          to: [route.recipient],
          subject: route.qaRouted
            ? `[QA: ${route.originalRecipient}] Reset your password`
            : "Reset your password",
          headers: route.qaRouted
            ? { "X-QA-Original-Recipient": route.originalRecipient }
            : undefined,
          html: `${route.qaRouted ? `<p><strong>QA routed for ${route.originalRecipient}</strong></p>` : ""}<p>Click <a href="${url}">here</a> to reset your password.</p>`,
        }),
      });
    },
  },
  session: {
    additionalFields: {
      qaAuthorizationId: {
        input: false,
        required: false,
        type: "string",
      },
      qaMembershipId: {
        input: false,
        required: false,
        type: "string",
      },
      qaWorkspaceId: {
        input: false,
        required: false,
        type: "string",
      },
    },
  },
  socialProviders: {
    google: {
      clientId: readNonEmptyEnv("GOOGLE_CLIENT_ID") ?? "",
      clientSecret: readNonEmptyEnv("GOOGLE_CLIENT_SECRET") ?? "",
    },
  },
  secret: getAuthSecret(),
  trustedOrigins: getTrustedOrigins(),
});

export type AuthenticatedUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session;
