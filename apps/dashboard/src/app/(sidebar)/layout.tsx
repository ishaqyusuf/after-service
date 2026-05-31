import { Sidebar } from "@/components/sidebar";
import type { ReactNode } from "react";
import { Badge } from "@afterservice/ui";

export default function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <Sidebar />
      <div className="md:ml-[70px] pb-4 min-h-screen flex flex-col">
        <header className="h-[70px] flex items-center justify-between px-4 md:px-8 border-b border-border bg-background sticky top-0 z-40">
          <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">
            Workspace setup pending
          </Badge>
          <a href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Settings
          </a>
        </header>
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
