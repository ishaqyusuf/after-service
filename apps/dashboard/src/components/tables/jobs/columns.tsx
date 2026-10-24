"use client";

import type { AppRouter } from "@afterservice/api/router";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@afterservice/ui";
import type { ColumnDef } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { AskAssistantButton } from "@/components/assistant/assistant-launcher";
import {
  ACTIONS_CELL_CLASS,
  EmptyCell,
  IDENTITY_CELL_CLASS,
  IdentityCell,
  RowActionsTrigger,
  StopRowClick,
} from "@/components/tables/core";
import {
  type ServiceJobStatus,
  serviceJobStatusLabels,
  toServiceJobStatus,
} from "@/hooks/use-job-filter-params";

type JobsListPage = inferRouterOutputs<AppRouter>["serviceJobs"]["list"];
type ServiceJob = JobsListPage["items"][number];

const jobStatusClassNames: Record<ServiceJobStatus, string> = {
  completed: "bg-[color:var(--wp-teal-soft)] text-[color:var(--wp-teal-ink)]",
  needs_follow_up:
    "bg-[color:var(--wp-upcoming-soft)] text-[color:var(--wp-upcoming-ink)]",
  resolved:
    "bg-[color:var(--wp-replied-soft)] text-[color:var(--wp-replied-ink)]",
};

export const columns: ColumnDef<ServiceJob>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: "Title",
    size: 250,
    minSize: 200,
    maxSize: 400,
    enableResizing: true,
    meta: {
      sticky: true,
      skeleton: { type: "text", width: "w-32" },
      headerLabel: "Title",
      className: `w-[250px] min-w-[200px] ${IDENTITY_CELL_CLASS}`,
    },
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 flex-1">
          <IdentityCell label={row.original.title}>
            {row.original.title}
          </IdentityCell>
        </span>
        <StopRowClick className="shrink-0">
          <AskAssistantButton
            kind="jobs"
            id={row.original.id}
            label={row.original.title}
          />
        </StopRowClick>
      </div>
    ),
  },
  {
    id: "customer",
    accessorKey: "customer.name",
    header: "Customer",
    size: 200,
    minSize: 150,
    maxSize: 300,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-24" },
      headerLabel: "Customer",
      className: "w-[200px] min-w-[150px]",
    },
    cell: ({ row }) =>
      row.original.customer?.name ? (
        <span className="truncate">{row.original.customer.name}</span>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "badge" },
      headerLabel: "Status",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const status = toServiceJobStatus(row.original.status);

      return (
        <span
          className={cn(
            "inline-flex h-[22px] items-center whitespace-nowrap rounded-full px-2 text-xs font-semibold",
            status
              ? jobStatusClassNames[status]
              : "bg-[color:var(--wp-rail)] text-[color:var(--wp-ink-2)]",
          )}
        >
          {status ? serviceJobStatusLabels[status] : row.original.status}
        </span>
      );
    },
  },
  {
    id: "serviceCategory",
    accessorKey: "serviceCategory",
    header: "Category",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-20" },
      headerLabel: "Category",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) =>
      row.original.serviceCategory ? (
        <span className="truncate">{row.original.serviceCategory}</span>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "amountCents",
    accessorKey: "amountCents",
    header: "Amount",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-16" },
      headerLabel: "Amount",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const amount = row.original.amountCents;
      if (amount == null) return <EmptyCell />;
      return (
        <span className="wp-numerals whitespace-nowrap">
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: row.original.currency,
          }).format(amount / 100)}
        </span>
      );
    },
  },
  {
    id: "completedAt",
    accessorKey: "completedAt",
    header: "Completed at",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-24" },
      headerLabel: "Completed at",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const date = row.original.completedAt;
      if (!date) return <EmptyCell />;
      return (
        <span className="wp-numerals whitespace-nowrap">
          {format(new Date(date), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Notes",
    size: 250,
    minSize: 150,
    maxSize: 400,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-40" },
      headerLabel: "Notes",
      className: "w-[250px] min-w-[150px]",
    },
    cell: ({ row }) =>
      row.original.notes ? (
        <span
          className="block w-full truncate text-[color:var(--wp-ink-2)]"
          title={row.original.notes}
        >
          {row.original.notes}
        </span>
      ) : (
        <EmptyCell />
      ),
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
            <RowActionsTrigger label={`Actions for ${row.original.title}`} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl">
            <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
              {row.original.title}
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="min-h-10"
              onClick={(e) => {
                e.stopPropagation();
                table.options.meta?.scheduleFollowUp?.(row.original.id);
              }}
            >
              Schedule follow-up
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
