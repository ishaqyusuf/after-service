import { getDbClient } from "@afterservice/db";
import { getAppUrls } from "@afterservice/utils";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

function unique(values: Array<string | undefined>) {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
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

export function getTrustedOrigins() {
  const urls = getAppUrls();

  return unique(
    [
      urls.site,
      urls.dashboard,
      ...localAuthOrigins,
      process.env.BETTER_AUTH_TRUSTED_ORIGINS,
      process.env.AUTH_TRUSTED_ORIGINS,
    ].flatMap((value) =>
      value?.split(",").map((origin: string) => origin.trim()),
    ),
  );
}

export function getAuthBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    getAppUrls().api
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
  },
  secret:
    process.env.BETTER_AUTH_SECRET ??
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "afterservice-local-development-secret"),
  trustedOrigins: getTrustedOrigins(),
});

export type AuthenticatedUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session;
