"use client";

import { dashboardNavItems } from "@afterservice/site-nav";
import { cn } from "@afterservice/ui/cn";
import { Icons } from "@afterservice/ui/icons";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

type NavIcon = ComponentType<{ className?: string }>;

const navIcons: Record<string, NavIcon> = {
  "/": Icons.Overview,
  "/customers": Icons.Customers,
  "/jobs": Icons.Transactions,
  "/follow-ups": Icons.Notifications,
  "/templates": Icons.Description,
  "/assistant": MessageCircle,
  "/billing": Icons.Currency,
  "/settings": Icons.Settings,
};

/** Label shown beside a collapsed rail item on hover and keyboard focus. */
export function NavTooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[60] -translate-y-1/2",
        "whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[12.5px] font-semibold text-background",
        "opacity-0 shadow-[var(--wp-shadow)] transition-opacity duration-150 motion-reduce:transition-none",
        "group-hover:opacity-100 group-focus-visible:opacity-100",
      )}
    >
      {label}
    </span>
  );
}

export function MainMenu({
  isExpanded,
  onSelect,
  size = "rail",
}: {
  isExpanded: boolean;
  onSelect?: () => void;
  size?: "rail" | "drawer";
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="px-3 py-3.5">
      <ul className="grid gap-0.5">
        {dashboardNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = navIcons[item.href];

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onSelect}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[10px] transition-colors",
                  size === "drawer" ? "h-12 text-[15px]" : "h-[42px] text-sm",
                  isExpanded
                    ? "justify-start px-3"
                    : "mx-auto w-12 justify-center px-0",
                  isActive
                    ? "bg-[color:var(--wp-paper)] font-semibold text-[color:var(--wp-teal-ink)] shadow-[0_0_0_1px_var(--wp-line)]"
                    : "font-medium text-[color:var(--wp-ink-2)] hover:bg-[color:var(--wp-hover)] hover:text-foreground",
                )}
              >
                {Icon && <Icon className="size-5 shrink-0" />}
                <span
                  className={cn(
                    "overflow-hidden text-ellipsis whitespace-nowrap",
                    !isExpanded && "sr-only",
                  )}
                >
                  {item.label}
                </span>
                {!isExpanded && <NavTooltip label={item.label} />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
