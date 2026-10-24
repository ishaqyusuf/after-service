"use client";

import { BrandLogo, Icons } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { MainMenu, NavTooltip } from "./main-menu";
import { UserMenu } from "./user-menu";

export function Sidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const isExpanded = !collapsed;

  return (
    <aside
      id="dashboard-sidebar"
      aria-label="Sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden flex-col md:flex",
        "border-r border-[color:var(--wp-line)] bg-[color:var(--wp-rail)]",
        "transition-[width] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
        isExpanded ? "w-[236px]" : "w-[72px]",
      )}
    >
      <div
        className={cn(
          "flex h-[70px] shrink-0 items-center overflow-hidden border-b border-[color:var(--wp-line)]",
          isExpanded ? "px-[18px]" : "justify-center",
        )}
      >
        <Link
          href="/"
          aria-label="afterservice overview"
          className="flex items-center rounded-[10px] transition-none"
        >
          {isExpanded ? <BrandLogo name="afterservice" /> : <Icons.LogoSmall />}
        </Link>
      </div>

      <div
        className={cn(
          "flex-1",
          isExpanded ? "overflow-y-auto overflow-x-hidden" : "overflow-visible",
        )}
      >
        <MainMenu isExpanded={isExpanded} />
      </div>

      <div className="grid shrink-0 gap-1 border-t border-[color:var(--wp-line)] p-3">
        <div className="min-w-0 overflow-hidden rounded-[10px] [&>button]:rounded-[10px] [&>button]:px-2 [&>button]:py-2">
          <UserMenu isExpanded={isExpanded} />
        </div>

        <button
          type="button"
          aria-controls="dashboard-sidebar"
          aria-expanded={isExpanded}
          onClick={() => onCollapsedChange(isExpanded)}
          className={cn(
            "group relative flex h-10 items-center gap-3 rounded-[10px] text-sm font-medium",
            "text-[color:var(--wp-ink-2)] transition-colors hover:bg-[color:var(--wp-hover)] hover:text-foreground",
            isExpanded ? "px-3" : "justify-center px-0",
          )}
        >
          {isExpanded ? (
            <PanelLeftClose className="size-[18px] shrink-0" aria-hidden />
          ) : (
            <PanelLeftOpen className="size-[18px] shrink-0" aria-hidden />
          )}
          <span className={cn(!isExpanded && "sr-only")}>
            {isExpanded ? "Collapse" : "Expand"}
            <span className="sr-only"> sidebar</span>
          </span>
          {!isExpanded && <NavTooltip label="Expand sidebar" />}
        </button>
      </div>
    </aside>
  );
}
