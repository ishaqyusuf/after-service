import { auth } from "@afterservice/auth";
import { getDbClient, validateQaDerivedSession } from "@afterservice/db";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AssistantProvider } from "@/components/assistant/assistant-provider";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider";
import { parseSidebarState, SIDEBAR_COOKIE } from "@/lib/sidebar-state";

export default async function SidebarLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const db = getDbClient();
  const qaValidation = session.session.qaAuthorizationId
    ? await validateQaDerivedSession(db, session.session.id)
    : null;
  if (qaValidation?.active === false) {
    redirect("/sign-in");
  }
  const membership = await db.membership.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    where: {
      id: qaValidation?.scope?.membershipId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  const cookieStore = await cookies();
  const sidebarState = parseSidebarState(
    cookieStore.get(SIDEBAR_COOKIE)?.value,
  );

  return (
    <AssistantProvider key={`${session.user.id}:${membership.workspace.id}`}>
      <GlobalSheetsProvider />
      <DashboardShell initialSidebarState={sidebarState}>
        <Header />
        <main id="main-content" tabIndex={-1} className="px-3 sm:px-4 md:px-8">
          {children}
        </main>
      </DashboardShell>
    </AssistantProvider>
  );
}
