import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.API_PROXY_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:4102"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4102"));

const nextConfig: NextConfig = {
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

export default nextConfig;
