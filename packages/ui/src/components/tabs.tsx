import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  items: Array<{
    active?: boolean;
    href: string;
    label: ReactNode;
  }>;
};

export function Tabs({ className, items, ...props }: TabsProps) {
  return (
    <div className={cn("as-tabs", className)} {...props}>
      {items.map((item) => (
        <a
          aria-current={item.active ? "page" : undefined}
          className="as-tabs__item"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
