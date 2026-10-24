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
import {
  ACTIONS_CELL_CLASS,
  ChannelLabel,
  EmptyCell,
  IDENTITY_CELL_CLASS,
  IdentityCell,
  RowActionsTrigger,
} from "@/components/tables/core";
import {
  type FollowUpStatus,
  followUpChannelLabels,
  followUpStatusLabels,
  toFollowUpChannel,
  toFollowUpStatus,
} from "@/hooks/use-follow-up-filter-params";

type FollowUpsListPage =
  inferRouterOutputs<AppRouter>["followUps"]["listTable"];
type FollowUp = FollowUpsListPage["items"][number];

// Sticker shape per stored status. The text label always carries the meaning;
// board stages (Due today, Upcoming, ...) are derived separately on the board.
const followUpStatusStage: Record<FollowUpStatus, string> = {
  closed: "wp-stage-closed",
  missed: "wp-stage-due",
  open: "wp-stage-upcoming",
  replied: "wp-stage-replied",
  scheduled: "wp-stage-upcoming",
  sent: "wp-stage-waiting",
};

export const columns: ColumnDef<FollowUp>[] = [
  {
    id: "customer",
    accessorKey: "customerName",
    header: "Customer",
    size: 250,
    minSize: 200,
    maxSize: 400,
    enableResizing: true,
    meta: {
      sticky: true,
      skeleton: { type: "text", width: "w-32" },
      headerLabel: "Customer",
      className: `w-[250px] min-w-[200px] ${IDENTITY_CELL_CLASS}`,
    },
    cell: ({ row }) => (
      <IdentityCell label={row.original.customerName}>
        {row.original.customerName}
      </IdentityCell>
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
      const status = toFollowUpStatus(row.original.status);

      return (
        <span
          className={cn(
            "wp-stage",
            status ? followUpStatusStage[status] : "wp-stage-closed",
          )}
        >
          <span className="wp-stage-dot" aria-hidden />
          {status ? followUpStatusLabels[status] : row.original.status}
        </span>
      );
    },
  },
  {
    id: "channel",
    accessorKey: "channel",
    header: "Channel",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "badge" },
      headerLabel: "Channel",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const channel = toFollowUpChannel(row.original.channel);

      return (
        <ChannelLabel
          channel={row.original.channel}
          label={
            channel ? followUpChannelLabels[channel] : row.original.channel
          }
        />
      );
    },
  },
  {
    id: "dueAt",
    accessorKey: "dueAt",
    header: "Due at",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-24" },
      headerLabel: "Due at",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const date = row.original.dueAt;
      if (!date) return <EmptyCell />;
      return (
        <span className="wp-numerals whitespace-nowrap">
          {format(new Date(date), "MMM d, yyyy")}
        </span>
      );
    },
  },
  {
    id: "job",
    accessorKey: "serviceTitle",
    header: "Job",
    size: 200,
    minSize: 150,
    maxSize: 300,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-32" },
      headerLabel: "Job",
      className: "w-[200px] min-w-[150px]",
    },
    cell: ({ row }) =>
      row.original.serviceTitle ? (
        <span className="block w-full truncate">
          {row.original.serviceTitle}
        </span>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Notes",
    size: 300,
    minSize: 200,
    maxSize: 500,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-64" },
      headerLabel: "Notes",
      className: "w-[300px] min-w-[200px]",
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
            <RowActionsTrigger
              label={`Actions for ${row.original.customerName}`}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl">
            <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
              {row.original.customerName}
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="min-h-10"
              onClick={(e) => {
                e.stopPropagation();
                table.options.meta?.closeFollowUp?.(row.original.id);
              }}
            >
              Close follow-up
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
