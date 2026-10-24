"use client";

import {
  cn,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import type {
  ColumnDef,
  ColumnSizingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useStickyColumns } from "@/hooks/use-sticky-columns";
import { SkeletonCell } from "./skeleton-cell";
import {
  ACTIONS_STICKY_HEADER_CLASS,
  getColumnId,
  getHeaderLabel,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEADER_CLASS,
  type TableColumnMeta,
} from "./types";

interface TableSkeletonProps<TData> {
  /** Column definitions with skeleton config in meta */
  columns: ColumnDef<TData>[];
  /** Number of skeleton rows to render */
  rowCount?: number;
  /** Column visibility state */
  columnVisibility?: VisibilityState;
  /** Column sizing state */
  columnSizing?: ColumnSizingState;
  /** Column order array */
  columnOrder?: string[];
  /** IDs of sticky columns (left-aligned) */
  stickyColumnIds?: string[];
  /** ID of the actions column (right-aligned sticky) */
  actionsColumnId?: string;
  /** Render in empty state (blurred) */
  isEmpty?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Announced to assistive tech while the table loads */
  label?: string;
}

/**
 * Generic table skeleton component
 * Renders an adaptive skeleton based on column definitions and their meta.skeleton config
 */
export function TableSkeleton<TData>({
  columns,
  rowCount = 40,
  columnVisibility = {},
  columnSizing = {},
  columnOrder = [],
  stickyColumnIds = [],
  actionsColumnId = "actions",
  isEmpty = false,
  className,
  label = "Loading table",
}: TableSkeletonProps<TData>) {
  // Generate row data for skeleton
  const rows = useMemo(
    () => [...Array(rowCount)].map((_, i) => ({ id: i.toString() })),
    [rowCount],
  );

  // Get ordered columns based on saved order, falling back to default order
  const orderedColumns = useMemo(() => {
    if (columnOrder.length > 0) {
      const ordered = columnOrder
        .map((id) => columns.find((c) => getColumnId(c) === id))
        .filter(Boolean) as typeof columns;

      const orderedIds = new Set(columnOrder);
      const remaining = columns.filter((c) => !orderedIds.has(getColumnId(c)));

      return [...ordered, ...remaining];
    }
    return columns;
  }, [columns, columnOrder]);

  // Filter by visibility
  const visibleColumns = useMemo(() => {
    return orderedColumns.filter((col) => {
      const id = getColumnId(col);
      // Always show select and actions columns
      if (id === "select" || id === actionsColumnId) return true;
      return columnVisibility[id] !== false;
    });
  }, [orderedColumns, columnVisibility, actionsColumnId]);

  // Use sticky columns hook for consistent positioning
  const { getStickyStyle, getStickyClassName } = useStickyColumns({
    columnVisibility,
    loading: true,
  });

  // Check if a column is sticky
  const isSticky = (columnId: string) => stickyColumnIds.includes(columnId);

  return (
    <div
      className={cn("w-full", !isEmpty && "wp-table-frame", className)}
      aria-busy={!isEmpty || undefined}
    >
      {!isEmpty && (
        <p className="sr-only" role="status">
          {label}
        </p>
      )}
      <div className="overflow-hidden" aria-hidden>
        <Table
          className={cn(isEmpty && "opacity-20 pointer-events-none blur-[7px]")}
        >
          <TableHeader className={TABLE_HEADER_CLASS}>
            <TableRow className="h-[45px] hover:bg-transparent flex items-center !border-b-0">
              {visibleColumns.map((col) => {
                const columnId = getColumnId(col);
                const sticky = isSticky(columnId);
                const isActions = columnId === actionsColumnId;

                // Match TanStack Table's getSize() behavior
                const width = columnSizing[columnId] ?? col.size ?? 150;
                const minWidth = sticky ? width : (col.minSize ?? width);
                const maxWidth = sticky ? width : (col.maxSize ?? width);

                const stickyClass = getStickyClassName(
                  columnId,
                  TABLE_HEAD_CELL_CLASS,
                );
                const headerClassName = isActions
                  ? ACTIONS_STICKY_HEADER_CLASS
                  : sticky
                    ? `${stickyClass} z-10 md:shadow-[1px_0_0_hsl(var(--border))]`
                    : stickyClass;

                return (
                  <TableHead
                    key={columnId}
                    className={headerClassName}
                    style={{
                      width,
                      minWidth,
                      maxWidth,
                      ...getStickyStyle(columnId),
                    }}
                  >
                    {columnId === "select" ? (
                      <Skeleton className="h-4 w-4" />
                    ) : (
                      <span className="truncate">{getHeaderLabel(col)}</span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody className="border-l-0 border-r-0">
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className="group h-[45px] flex items-center border-b border-border"
              >
                {visibleColumns.map((col) => {
                  const columnId = getColumnId(col);
                  const meta = col.meta as TableColumnMeta | undefined;
                  const sticky = isSticky(columnId);
                  const isActions = columnId === actionsColumnId;

                  // Match TanStack Table's getSize() behavior
                  const width = columnSizing[columnId] ?? col.size ?? 150;
                  const minWidth = sticky ? width : (col.minSize ?? width);
                  const maxWidth = sticky ? width : (col.maxSize ?? width);

                  const cellClassName = cn(
                    "h-full flex items-center border-r-0",
                    getStickyClassName(columnId, meta?.className),
                    isActions && "justify-center",
                  );

                  return (
                    <TableCell
                      key={columnId}
                      className={cellClassName}
                      style={{
                        width,
                        minWidth,
                        maxWidth,
                        ...getStickyStyle(columnId),
                      }}
                    >
                      {meta?.skeleton ? (
                        <SkeletonCell
                          type={meta.skeleton.type}
                          width={meta.skeleton.width}
                        />
                      ) : (
                        // Default fallback skeleton
                        <Skeleton className="h-3.5 w-24" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
