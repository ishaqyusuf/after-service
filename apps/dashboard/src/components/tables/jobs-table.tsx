"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { centsToDollars, formatDate } from "@/lib/dashboard-format";
import Link from "next/link";
import { trpc } from "@/components/providers/trpc-provider";

export function JobsTable() {
  const { data: jobsData, isLoading } = trpc.serviceJobs.list.useQuery();
  const jobs = jobsData?.items ?? [];

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading jobs...</div>;
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[100px]">Follow-up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="font-semibold">{job.title}</div>
                <div className="text-sm text-muted-foreground">
                  {job.serviceCategory ?? job.status}
                </div>
              </TableCell>
              <TableCell>{job.customer.name}</TableCell>
              <TableCell>{formatDate(job.completedAt)}</TableCell>
              <TableCell>
                {centsToDollars(job.amountCents) || "Unset"}
              </TableCell>
              <TableCell>
                <Link href={`?schedule_follow_up=${job.id}`} scroll={false} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Schedule
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No jobs yet. Create a customer, then log completed work.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
