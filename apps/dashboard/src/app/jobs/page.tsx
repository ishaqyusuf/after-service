import { Badge, Button } from "@afterservice/ui";
import { getJobsData } from "@/lib/dashboard-data";
import { CreateJobForm } from "@/components/forms/create-job-form";
import { JobsTable } from "@/components/tables/jobs-table";
import Link from "next/link";

export default async function JobsPage() {
  const { customers, jobs, templates, workspace } = await getJobsData();
  const defaultDue = new Date(
    Date.now() + workspace.defaultFollowUpDelayDays * 86400000,
  )
    .toISOString()
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2">Service jobs</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground max-w-2xl">
            Log completed work and turn it into follow-up actions using the
            workspace default cadence.
          </p>
        </div>
        <Button asChild>
          <Link href="/follow-ups">Open board</Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        <CreateJobForm customers={customers} defaultDue={defaultDue} />

        <section className="min-w-0">
          <JobsTable jobs={jobs} templates={templates} defaultDue={defaultDue} />
        </section>
      </div>
    </div>
  );
}

