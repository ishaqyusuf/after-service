"use client";

import type { AppRouter } from "@afterservice/api/router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@afterservice/ui";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { Building, Mail, Phone } from "lucide-react";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import {
  ACTIONS_CELL_CLASS,
  EmptyCell,
  IDENTITY_CELL_CLASS,
  IdentityCell,
  RowActionsTrigger,
  StopRowClick,
} from "@/components/tables/core";

type CustomersListPage = inferRouterOutputs<AppRouter>["customers"]["list"];
type Customer = CustomersListPage["items"][number];

export const columns: ColumnDef<Customer>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    size: 250,
    minSize: 200,
    maxSize: 400,
    enableResizing: true,
    meta: {
      sticky: true,
      skeleton: { type: "text", width: "w-32" },
      headerLabel: "Name",
      className: `w-[250px] min-w-[200px] ${IDENTITY_CELL_CLASS}`,
    },
    cell: ({ row }) => (
      <IdentityCell label={row.original.name}>{row.original.name}</IdentityCell>
    ),
  },
  {
    id: "companyName",
    accessorKey: "companyName",
    header: "Company",
    size: 200,
    minSize: 150,
    maxSize: 300,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-24" },
      headerLabel: "Company",
      className: "w-[200px] min-w-[150px]",
    },
    cell: ({ row }) =>
      row.original.companyName ? (
        <div className="flex min-w-0 items-center gap-1.5 text-[color:var(--wp-ink-2)]">
          <Building className="size-[15px] shrink-0" aria-hidden />
          <span className="truncate">{row.original.companyName}</span>
        </div>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    size: 220,
    minSize: 150,
    maxSize: 350,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-32" },
      headerLabel: "Email",
      className: "w-[220px] min-w-[150px]",
    },
    cell: ({ row }) =>
      row.original.email ? (
        <StopRowClick className="items-center gap-1.5">
          <Mail
            className="size-[15px] shrink-0 text-muted-foreground"
            aria-hidden
          />
          <a
            href={`mailto:${row.original.email}`}
            className="truncate rounded-sm text-foreground underline decoration-[color:var(--wp-line-2)] underline-offset-[3px] hover:text-[color:var(--wp-teal-ink)] hover:decoration-current"
          >
            {row.original.email}
          </a>
        </StopRowClick>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: "Phone",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-24" },
      headerLabel: "Phone",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) =>
      row.original.phone ? (
        <StopRowClick className="items-center gap-1.5">
          <Phone
            className="size-[15px] shrink-0 text-muted-foreground"
            aria-hidden
          />
          <a
            href={`tel:${row.original.phone}`}
            className="wp-numerals truncate rounded-sm text-foreground underline decoration-[color:var(--wp-line-2)] underline-offset-[3px] hover:text-[color:var(--wp-teal-ink)] hover:decoration-current"
          >
            {row.original.phone}
          </a>
        </StopRowClick>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "lastServiceAt",
    accessorKey: "lastServiceAt",
    header: "Last service",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-20" },
      headerLabel: "Last service",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const date = row.original.lastServiceAt;
      if (!date) return <EmptyCell />;
      return (
        <span className="wp-numerals whitespace-nowrap">
          {format(new Date(date), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "openFollowUpCount",
    accessorKey: "openFollowUpCount",
    header: "Follow-ups",
    size: 120,
    minSize: 100,
    maxSize: 150,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-10" },
      headerLabel: "Follow-ups",
      className: "w-[120px] min-w-[100px]",
    },
    cell: ({ row }) => {
      const count = row.original.openFollowUpCount;
      if (count === 0) return <EmptyCell />;
      return (
        <span className="wp-numerals inline-flex h-[22px] items-center whitespace-nowrap rounded-full bg-[color:var(--wp-teal-soft)] px-2 text-xs font-semibold text-[color:var(--wp-teal-ink)]">
          {count} open
        </span>
      );
    },
  },
  {
    id: "tags",
    accessorKey: "tags",
    header: "Tags",
    size: 200,
    minSize: 150,
    maxSize: 300,
    enableResizing: true,
    meta: {
      skeleton: { type: "tags" },
      headerLabel: "Tags",
      className: "w-[200px] min-w-[150px]",
    },
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) return <EmptyCell />;
      return (
        <div className="flex gap-1 overflow-hidden">
          {tags.map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-md border border-[color:var(--wp-line)] bg-[color:var(--wp-paper)] px-[7px] py-px text-xs text-[color:var(--wp-ink-2)]"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    minSize: 100,
    maxSize: 100,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    meta: {
      sticky: true,
      skeleton: { type: "icon" },
      headerLabel: "Actions",
      className: ACTIONS_CELL_CLASS,
    },
    cell: ({ row, table }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <RowActionsTrigger label={`Actions for ${row.original.name}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {row.original.name}
            </DropdownMenuLabel>
            <ConfirmActionDialog
              title="Archive this customer?"
              description={`${row.original.name} will be hidden from customer lists. Jobs and follow-up history stay in the workspace.`}
              confirmLabel="Archive customer"
              onConfirm={() =>
                table.options.meta?.archiveCustomer?.(row.original.id)
              }
            >
              <DropdownMenuItem
                className="min-h-11 text-[color:var(--wp-due-ink)] focus:text-[color:var(--wp-due-ink)]"
                onSelect={(event) => event.preventDefault()}
                onClick={(event) => event.stopPropagation()}
              >
                Archive customer
              </DropdownMenuItem>
            </ConfirmActionDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
