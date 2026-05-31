"use client";

import { dashboardNavItems } from "@afterservice/site-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainMenu({ isExpanded }: { isExpanded: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard navigation" className="flex flex-col gap-2 px-3 py-4">
      {dashboardNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            href={item.href}
            key={item.href}
            className={`flex items-center h-10 rounded-md transition-colors relative overflow-hidden ${
              isExpanded ? "justify-start px-3" : "justify-center px-0 w-10 mx-auto"
            } ${
              isActive
                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium"
            }`}
            title={!isExpanded ? item.label : undefined}
          >
            {/* If we had icons per item, we would render them here. Assuming first letter for now if no icons. */}
            {!isExpanded && (
              <span className="text-sm font-bold opacity-70">
                {item.label.substring(0, 1)}
              </span>
            )}
            
            {isExpanded && (
              <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
