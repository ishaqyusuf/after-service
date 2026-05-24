import { Badge, EmptyState } from "@afterservice/ui";

type PageShellProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  eyebrow?: string;
  title: string;
};

export function PageShell({
  actionHref,
  actionLabel,
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
      <EmptyState title={`${title} workspace`}>
        This area is ready for the next product phase.
      </EmptyState>
    </main>
  );
}
