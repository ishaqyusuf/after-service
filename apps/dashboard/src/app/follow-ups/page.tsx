import { PageShell } from "@/lib/page-shell";

export default function FollowUpsPage() {
  return (
    <PageShell
      actionHref="/templates"
      actionLabel="View templates"
      description="The follow-up board will track open, scheduled, sent, replied, and missed work."
      title="Follow-ups"
    />
  );
}
