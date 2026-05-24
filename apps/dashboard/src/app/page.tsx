import { getAppUrls } from "@afterservice/utils";
import { PageShell } from "@/lib/page-shell";

export default function DashboardPage() {
  const urls = getAppUrls();

  return (
    <PageShell
      actionHref={urls.site}
      actionLabel="Back to website"
      description="Operator overview shell for follow-up work, customers, and jobs."
      title="Dashboard"
    />
  );
}
