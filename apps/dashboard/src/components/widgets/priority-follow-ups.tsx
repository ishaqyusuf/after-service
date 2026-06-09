"use client";

import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/dashboard-format";
import { statusLabels } from "./constants";
import type { DashboardOverviewData } from "./overview-types";

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

export function PriorityFollowUps({ data }: { data: DashboardOverviewData }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b pb-5">
        <div>
          <CardTitle className="mb-1 text-base">Priority follow-ups</CardTitle>
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
            {data.recentFollowUps.map((followUp) => (
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
            {data.recentFollowUps.length === 0 ? (
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
  );
}
