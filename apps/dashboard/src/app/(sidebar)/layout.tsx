import { auth } from "@afterservice/auth";
import { getDbClient } from "@afterservice/db";
import { Badge } from "@afterservice/ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
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
      userId: session.user.id,
    },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  return (
    <div className="relative">
      <Sidebar />
      <div className="md:ml-[70px] pb-4 min-h-screen flex flex-col">
        <header className="h-[70px] flex items-center justify-between px-4 md:px-8 border-b border-border bg-background sticky top-0 z-40">
          <Badge
            variant="outline"
            className="text-success border-success/50 bg-success/10"
          >
            {membership.workspace.name}
          </Badge>
          <a
            href="/settings"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Settings
          </a>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
