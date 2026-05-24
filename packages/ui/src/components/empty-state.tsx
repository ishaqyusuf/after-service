import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type EmptyStateProps = {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  title: string;
};

export function EmptyState({
  action,
  children,
  className,
  title,
}: EmptyStateProps) {
  return (
    <section className={cn("as-empty-state", className)}>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
      {action}
    </section>
  );
}
