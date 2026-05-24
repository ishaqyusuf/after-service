import { PageShell } from "@/lib/page-shell";

export default function TemplatesPage() {
  return (
    <PageShell
      actionHref="/billing"
      actionLabel="View billing"
      description="Reusable follow-up templates and merge tags will be managed here."
      title="Templates"
    />
  );
}
