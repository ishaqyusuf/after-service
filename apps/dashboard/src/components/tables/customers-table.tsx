"use client";

import {
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
import { useSearchParams } from "next/navigation";

export function CustomersTable() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const { data, isLoading } = trpc.customers.list.useQuery({ search: q, includeArchived: false });
  const customers = data?.items ?? [];

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading customers...</div>;
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Last service</TableHead>
            <TableHead>Open follow-ups</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="font-semibold">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.companyName ?? customer.tags.join(", ")}
                </div>
              </TableCell>
              <TableCell>
                {customer.email ?? customer.phone ?? "No contact"}
              </TableCell>
              <TableCell>{formatDate(customer.lastServiceAt)}</TableCell>
              <TableCell>{customer.openFollowUpCount}</TableCell>
              <TableCell>
                <Link href={`?edit_customer=${customer.id}`} scroll={false} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Edit
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No customers match this view.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
