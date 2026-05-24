type PageShellProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
};

export function PageShell({
  actionHref,
  actionLabel,
  description,
  title,
}: PageShellProps) {
  return (
    <main>
      <header>
        <h1>{title}</h1>
        <p>{description}</p>
        {actionHref && actionLabel ? (
          <a href={actionHref}>{actionLabel}</a>
        ) : null}
      </header>
    </main>
  );
}
