import type { DetailsHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type DropdownProps = DetailsHTMLAttributes<HTMLDetailsElement> & {
  label: ReactNode;
};

export function Dropdown({
  children,
  className,
  label,
  ...props
}: DropdownProps) {
  return (
    <details className={cn("as-dropdown", className)} {...props}>
      <summary>{label}</summary>
      <div className="as-dropdown__content">{children}</div>
    </details>
  );
}
