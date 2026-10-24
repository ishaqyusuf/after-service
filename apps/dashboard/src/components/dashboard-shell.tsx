"use client";

import { cn } from "@afterservice/ui/cn";
import { type ReactNode, useCallback, useState } from "react";
import { SIDEBAR_COOKIE, type SidebarState } from "@/lib/sidebar-state";
import { Sidebar } from "./sidebar";

export function DashboardShell({
  children,
  initialSidebarState,
}: {
  children: ReactNode;
  initialSidebarState: SidebarState;
}) {
  const [collapsed, setCollapsed] = useState(
    initialSidebarState === "collapsed",
  );

  const handleCollapsedChange = useCallback((next: boolean) => {
    setCollapsed(next);
    // biome-ignore lint/suspicious/noDocumentCookie: the server layout reads this preference to avoid a width flash.
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return (
    <div className="relative min-h-screen bg-[color:var(--wp-ground)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-[10px] focus:bg-foreground focus:px-3.5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
      />
      <div
        className={cn(
          "min-w-0 pb-4 transition-[padding] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
          collapsed ? "md:pl-[72px]" : "md:pl-[236px]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
