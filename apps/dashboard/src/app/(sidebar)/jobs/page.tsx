import { Badge } from "@afterservice/ui";
import { CreateJobForm } from "@/components/forms/create-job-form";
import { JobsTable } from "@/components/tables/jobs-table";
import { Suspense } from "react";

export default async function JobsPage() {
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <Badge variant="outline" className="mb-2">Service logging</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground max-w-2xl">
          Record completed services and automatically schedule the appropriate follow-ups.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        <CreateJobForm defaultDue={defaultDue.toISOString().slice(0, 10)} />

        <section className="space-y-4 min-w-0">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
            <JobsTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
