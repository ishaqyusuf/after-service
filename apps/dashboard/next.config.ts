import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

function isInternalQaBuild(env = process.env) {
  const mode = (
    env.AFTERSERVICE_ENV_MODE ??
    env.NODE_ENV ??
    "production"
  ).toLowerCase();
  return (
    env.QA_ACCELERATOR_ENABLED === "true" &&
    new Set(["local", "dev", "development", "preview"]).has(mode)
  );
}

const apiBaseUrl =
  process.env.API_PROXY_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:4102"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4102"));

const nextConfig: NextConfig = {
  pageExtensions: isInternalQaBuild()
    ? ["qa.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
  turbopack: {
    resolveAlias: isInternalQaBuild()
      ? {}
      : {
          "@/components/qa/qa-access-panel":
            "@/components/qa/qa-access-panel.production",
          "@/components/quick-fill": "@/components/quick-fill.production",
        },
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          destination: `${apiBaseUrl}/trpc/:path*`,
          source: "/trpc/:path*",
        },
      ],
    };
  },
};

const isProduction = process.env.NODE_ENV === "production";
const sentryRelease =
  process.env.SENTRY_RELEASE || process.env.GIT_COMMIT_SHA || undefined;

export default isProduction
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      ...(sentryRelease ? { release: { name: sentryRelease } } : {}),
      sourcemaps: {
        deleteSourcemapsAfterUpload: true,
      },
    })
  : nextConfig;
