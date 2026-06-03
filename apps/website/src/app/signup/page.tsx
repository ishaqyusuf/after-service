import { buildDashboardUrl } from "@afterservice/utils";
import { headers } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sign up | After Service",
    description: "Create your After Service workspace.",
  };
}

export default async function SignupPage() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const dashboardUrl = buildDashboardUrl({
    currentHost: host,
    currentProtocol: protocol,
    path: "/sign-up",
  });

  return (
    <main className="site-page">
      <h1>Sign up</h1>
      <p>Workspace onboarding will begin from the dashboard app.</p>
      <a href={dashboardUrl}>Create workspace</a>
    </main>
  );
}
