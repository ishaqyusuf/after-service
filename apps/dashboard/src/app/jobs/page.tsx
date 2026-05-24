import { PageShell } from "@/lib/page-shell";

export default function JobsPage() {
  return (
    <PageShell
      actionHref="/follow-ups"
      actionLabel="View follow-ups"
      description="Completed service jobs will become the source for scheduled follow-ups."
      title="Jobs"
    />
  );
}
