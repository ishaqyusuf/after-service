import { Badge, EmptyState } from "@afterservice/ui";
import type { ReactNode } from "react";

type PageShellProps = {
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

export function PageShell({
  actionHref,
  actionLabel,
  children,
  description,
  eyebrow = "Phase placeholder",
  title,
}: PageShellProps) {
  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge>{eyebrow}</Badge>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <a href={actionHref}>{actionLabel}</a>
        ) : null}
      </header>
      {children ?? (
        <EmptyState title={`${title} workspace`}>
          This area is ready for the next product phase.
        </EmptyState>
      )}
    </main>
  );
}
