"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { formatDate } from "@/lib/dashboard-format";
import { trpc } from "@/components/providers/trpc-provider";
import Link from "next/link";

export function DashboardOverview() {
  const { data, isLoading } = trpc.dashboard.overview.useQuery();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading overview...</div>;
  }

  if (!data) return null;

  const { counts, recentFollowUps, workspace } = data;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="text-success border-success/50 bg-success/10 mb-2">Workspace live</Badge>
          <h1 className="text-3xl font-bold tracking-tight">{workspace.name}</h1>
          <p className="text-muted-foreground max-w-2xl">
            Today&apos;s after-service work, customer base, job history, and
            billing state in one operator view.
          </p>
        </div>
        <Button asChild>
          <Link href="/follow-ups">Work board</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" aria-label="Workspace metrics">
        <Metric label="Customers" value={counts.customers} />
        <Metric label="Completed jobs" value={counts.jobs} />
        <Metric label="Open follow-ups" value={counts.openFollowUps} />
        <Metric label="Due today" value={counts.dueToday} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Priority follow-ups</h2>
          <Button variant="outline" asChild>
            <Link href="/follow-ups">View all</Link>
          </Button>
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFollowUps.map((followUp) => (
                <TableRow key={followUp.id}>
                  <TableCell className="font-medium">{followUp.customerName}</TableCell>
                  <TableCell>
                    {followUp.serviceTitle ?? "General check-in"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={followUp.status === "sent" ? "secondary" : "outline"}
                    >
                      {followUp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(followUp.dueAt)}</TableCell>
                  <TableCell>
                    <Link href={`/follow-ups?follow_up_id=${followUp.id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {recentFollowUps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No open follow-ups yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
