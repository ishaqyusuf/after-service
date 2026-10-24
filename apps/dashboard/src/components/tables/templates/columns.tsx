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
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import {
  ACTIONS_CELL_CLASS,
  ChannelLabel,
  EmptyCell,
  IDENTITY_CELL_CLASS,
  IdentityCell,
  RowActionsTrigger,
} from "@/components/tables/core";
import {
  templateChannelLabels,
  toTemplateChannel,
} from "@/hooks/use-template-filter-params";

type TemplatesListPage = inferRouterOutputs<AppRouter>["templates"]["list"];
type Template = TemplatesListPage["items"][number];

export const columns: ColumnDef<Template>[] = [
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
      const channel = toTemplateChannel(row.original.channel);

      return (
        <ChannelLabel
          channel={row.original.channel}
          label={
            channel ? templateChannelLabels[channel] : row.original.channel
          }
        />
      );
    },
  },
  {
    id: "subject",
    accessorKey: "subject",
    header: "Subject",
    size: 250,
    minSize: 200,
    maxSize: 400,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-40" },
      headerLabel: "Subject",
      className: "w-[250px] min-w-[200px]",
    },
    cell: ({ row }) =>
      row.original.subject ? (
        <span className="block w-full truncate">{row.original.subject}</span>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "body",
    accessorKey: "body",
    header: "Body",
    size: 300,
    minSize: 200,
    maxSize: 600,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-64" },
      headerLabel: "Body",
      className: "w-[300px] min-w-[200px]",
    },
    cell: ({ row }) => (
      <span
        className="block w-full truncate text-[color:var(--wp-ink-2)]"
        title={row.original.body}
      >
        {row.original.body}
      </span>
    ),
  },
  {
    id: "isDefault",
    accessorKey: "isDefault",
    header: "Default",
    size: 100,
    minSize: 80,
    maxSize: 150,
    enableResizing: true,
    meta: {
      skeleton: { type: "badge" },
      headerLabel: "Default",
      className: "w-[100px] min-w-[80px]",
    },
    cell: ({ row }) =>
      row.original.isDefault ? (
        <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-full bg-[color:var(--wp-teal-soft)] px-2 text-xs font-semibold text-[color:var(--wp-teal-ink)]">
          Default
        </span>
      ) : (
        <EmptyCell />
      ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created at",
    size: 150,
    minSize: 120,
    maxSize: 200,
    enableResizing: true,
    meta: {
      skeleton: { type: "text", width: "w-24" },
      headerLabel: "Created at",
      className: "w-[150px] min-w-[120px]",
    },
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <EmptyCell />;
      return (
        <span className="wp-numerals whitespace-nowrap">
          {format(new Date(date), "MMM d, yyyy")}
        </span>
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
            <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
              {row.original.name}
            </DropdownMenuLabel>
            <ConfirmActionDialog
              title="Remove this template?"
              description={`${row.original.name} will be removed permanently. This cannot be undone.`}
              confirmLabel="Archive template"
              onConfirm={() =>
                table.options.meta?.archiveTemplate?.(row.original.id)
              }
            >
              <DropdownMenuItem
                className="min-h-11 text-[color:var(--wp-due-ink)] focus:text-[color:var(--wp-due-ink)]"
                onSelect={(event) => event.preventDefault()}
                onClick={(event) => event.stopPropagation()}
              >
                Archive template
              </DropdownMenuItem>
            </ConfirmActionDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
