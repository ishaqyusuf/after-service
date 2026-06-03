import { buildDashboardUrl } from "@afterservice/utils";
import { headers } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Log in | After Service",
    description: "Log in to your workspace.",
  };
}

export default async function LoginPage() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const dashboardUrl = buildDashboardUrl({
    currentHost: host,
    currentProtocol: protocol,
    path: "/sign-in",
  });

  return (
    <main className="site-page">
      <h1>Log in</h1>
      <p>Dashboard authentication will connect here in the auth phase.</p>
      <a href={dashboardUrl}>Continue to dashboard login</a>
    </main>
  );
}
