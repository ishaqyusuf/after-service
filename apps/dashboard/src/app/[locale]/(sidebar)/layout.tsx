import { auth } from "@afterservice/auth";
import { getDbClient, validateQaDerivedSession } from "@afterservice/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";

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

  return (
    <div className="relative">
      <Sidebar />
      <div className="md:ml-[70px] pb-4">
        <Header />
        <div className="px-4 md:px-8">{children}</div>
      </div>
    </div>
  );
}
