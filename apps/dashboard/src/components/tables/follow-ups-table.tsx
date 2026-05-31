"use client";

import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { formatDate } from "@/lib/dashboard-format";
import Link from "next/link";
import { trpc } from "@/components/providers/trpc-provider";

export function FollowUpsTable() {
  const { data: tableData, isLoading } = trpc.followUps.listTable.useQuery({});
  const items = tableData?.items ?? [];

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-semibold">{item.customerName}</div>
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {item.serviceTitle}
                </div>
              </TableCell>
              <TableCell className="uppercase text-xs font-medium">
                {item.channel}
              </TableCell>
              <TableCell>{formatDate(item.dueAt)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.status === "closed"
                      ? "secondary"
                      : item.status === "replied"
                        ? "default"
                        : "outline"
                  }
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`?follow_up_id=${item.id}`} scroll={false} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No follow-ups found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
