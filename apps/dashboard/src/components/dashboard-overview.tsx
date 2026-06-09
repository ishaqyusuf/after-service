"use client";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { ArrowUpRight, ClipboardList, Plus, Send } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/components/providers/trpc-provider";
import { formatDate } from "@/lib/dashboard-format";

const statusLabels: Record<string, string> = {
  closed: "Closed",
  missed: "Missed",
  open: "Open",
  replied: "Replied",
  scheduled: "Scheduled",
  sent: "Sent",
};

const channelLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const statusTone: Record<string, string> = {
  closed: "bg-emerald-500",
  missed: "bg-red-500",
  open: "bg-sky-500",
  replied: "bg-teal-500",
  scheduled: "bg-violet-500",
  sent: "bg-amber-500",
};

export function DashboardOverview() {
  const { data, isLoading } = trpc.dashboard.overview.useQuery();

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (!data) return null;

  const {
    counts,
    followUpChannels,
    followUpStatuses,
    recentFollowUps,
    recentJobs,
    workspace,
  } = data;
  const totalFollowUps = followUpStatuses.reduce(
    (total, item) => total + item.count,
    0,
  );
  const attentionCount = counts.overdueFollowUps + counts.dueToday;
  const resolvedRate =
    totalFollowUps > 0
      ? Math.round((counts.resolvedFollowUps / totalFollowUps) * 100)
      : 0;
  const busiestChannel = [...followUpChannels].sort(
    (a, b) => b.count - a.count,
  )[0];

  const metricCards = [
    {
      detail:
        attentionCount > 0 ? `${attentionCount} need attention` : "Clear today",
      href: "/follow-ups",
      label: "Due today",
      tone: attentionCount > 0 ? "text-amber-600" : "text-emerald-600",
      value: counts.dueToday,
    },
    {
      detail:
        counts.overdueFollowUps > 0 ? "Past due follow-ups" : "Nothing overdue",
      href: "/follow-ups",
      label: "Overdue",
      tone: counts.overdueFollowUps > 0 ? "text-red-600" : "text-emerald-600",
      value: counts.overdueFollowUps,
    },
    {
      detail: `${counts.upcomingFollowUps} due next 7 days`,
      href: "/follow-ups",
      label: "Open follow-ups",
      tone: "text-sky-600",
      value: counts.openFollowUps,
    },
    {
      detail: `${counts.completedThisWeek} completed this week`,
      href: "/jobs",
      label: "Completed jobs",
      tone: "text-teal-600",
      value: counts.jobs,
    },
    {
      detail: "Active customer records",
      href: "/customers",
      label: "Customers",
      tone: "text-violet-600",
      value: counts.customers,
    },
    {
      detail:
        counts.sentThisWeek > 0 ? "Messages sent this week" : "No sends yet",
      href: "/templates",
      label: "Sent this week",
      tone: "text-stone-700",
      value: counts.sentThisWeek,
    },
  ];

  const workload = [
    {
      color: "bg-red-500",
      href: "/follow-ups",
      label: "Overdue",
      value: counts.overdueFollowUps,
    },
    {
      color: "bg-amber-500",
      href: "/follow-ups",
      label: "Due today",
      value: counts.dueToday,
    },
    {
      color: "bg-sky-500",
      href: "/follow-ups",
      label: "Next 7 days",
      value: counts.upcomingFollowUps,
    },
  ];
  const maxWorkload = Math.max(...workload.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              Workspace live
            </Badge>
            <Badge variant="outline">
              {workspace.serviceCategory ??
                workspace.businessType ??
                "Local service"}
            </Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {workspace.name}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              A focused operating view for completed jobs, customer check-ins,
              overdue follow-ups, and the next work that keeps after-service
              moving.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/jobs">
              <Plus className="mr-2 size-4" />
              Log job
            </Link>
          </Button>
          <Button asChild>
            <Link href="/follow-ups">
              <ClipboardList className="mr-2 size-4" />
              Work board
            </Link>
          </Button>
        </div>
      </header>

      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Workspace metrics"
      >
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0 border-b pb-5">
            <div>
              <CardTitle className="mb-1 text-base">
                Today&apos;s queue
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                What needs operator attention before tomorrow.
              </p>
            </div>
            <Badge
              className={cn(
                "border-transparent",
                attentionCount > 0
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
              )}
            >
              {attentionCount > 0 ? `${attentionCount} active` : "Clear"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {workload.map((item) => (
              <WorkloadRow
                href={item.href}
                key={item.label}
                label={item.label}
                color={item.color}
                value={item.value}
                maxValue={maxWorkload}
              />
            ))}
            <div className="grid gap-3 border-t pt-5 sm:grid-cols-3">
              <SummaryStat label="Resolved" value={`${resolvedRate}%`} />
              <SummaryStat
                label="Default delay"
                value={`${workspace.defaultFollowUpDelayDays}d`}
              />
              <SummaryStat
                label="Top channel"
                value={
                  busiestChannel?.count
                    ? (channelLabels[busiestChannel.channel] ??
                      busiestChannel.channel)
                    : "None"
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-5">
            <CardTitle className="mb-1 text-base">Follow-up health</CardTitle>
            <p className="text-sm text-muted-foreground">
              Status mix across all follow-ups.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {followUpStatuses.map((item) => (
              <BreakdownRow
                color={statusTone[item.status] ?? "bg-muted-foreground"}
                key={item.status}
                label={statusLabels[item.status] ?? item.status}
                total={totalFollowUps}
                value={item.count}
              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-5">
            <div>
              <CardTitle className="mb-1 text-base">
                Priority follow-ups
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Earliest open check-ins across active customers.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/follow-ups">
                View all
                <ArrowUpRight className="ml-2 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="w-[90px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentFollowUps.map((followUp) => (
                  <TableRow key={followUp.id}>
                    <TableCell className="font-medium">
                      {followUp.customerName}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-muted-foreground">
                      {followUp.serviceTitle ?? "General check-in"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={followUp.status} />
                    </TableCell>
                    <TableCell>{formatDate(followUp.dueAt)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/follow-ups?follow_up_id=${followUp.id}`}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {recentFollowUps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No open follow-ups yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card>
          <CardHeader className="border-b pb-5">
            <CardTitle className="mb-1 text-base">Recent jobs</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest completed work feeding the follow-up loop.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {recentJobs.length > 0 ? (
              <div className="divide-y">
                {recentJobs.map((job) => (
                  <Link
                    className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/40"
                    href="/jobs"
                    key={job.id}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">
                        {job.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {job.customerName} · {formatDate(job.completedAt)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {job.status.replaceAll("_", " ")}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
                <Send className="size-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">No jobs logged yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Log completed work to create reliable follow-up moments.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/jobs">Open jobs</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {followUpChannels.map((item) => (
          <ChannelCard
            key={item.channel}
            label={channelLabels[item.channel] ?? item.channel}
            value={item.count}
            total={totalFollowUps}
          />
        ))}
      </section>
    </div>
  );
}

function MetricCard({
  detail,
  href,
  label,
  tone,
  value,
}: {
  detail: string;
  href: string;
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[116px] flex-col justify-between border border-border bg-background p-5 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div>
        <div className={cn("text-3xl font-semibold tracking-tight", tone)}>
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
    </Link>
  );
}

function WorkloadRow({
  color,
  href,
  label,
  maxValue,
  value,
}: {
  color: string;
  href: string;
  label: string;
  maxValue: number;
  value: number;
}) {
  return (
    <Link href={href} className="block space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden bg-muted">
        <div
          className={cn("h-full", color)}
          style={{
            width: `${Math.max((value / maxValue) * 100, value ? 8 : 0)}%`,
          }}
        />
      </div>
    </Link>
  );
}

function BreakdownRow({
  color,
  label,
  total,
  value,
}: {
  color: string;
  label: string;
  total: number;
  value: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className={cn("size-2", color)} />
          {label}
        </span>
        <span className="text-muted-foreground">
          {value} · {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden bg-muted">
        <div className={cn("h-full", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ChannelCard({
  label,
  total,
  value,
}: {
  label: string;
  total: number;
  value: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{percent}%</p>
        </div>
        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="text-2xl font-semibold">{value}</p>
          <div className="h-10 w-20 bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "missed"
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
      : status === "replied" || status === "closed"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
        : status === "sent"
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
          : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-50";

  return <Badge className={className}>{statusLabels[status] ?? status}</Badge>;
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function DashboardOverviewSkeleton() {
  const skeletonCards = ["due", "overdue", "open", "jobs", "customers", "sent"];

  return (
    <div className="space-y-6">
      <div className="h-32 animate-pulse border-b bg-muted/40" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonCards.map((key) => (
          <div
            className="h-[116px] animate-pulse border bg-muted/40"
            key={key}
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse border bg-muted/40" />
        <div className="h-72 animate-pulse border bg-muted/40" />
      </div>
    </div>
  );
}
