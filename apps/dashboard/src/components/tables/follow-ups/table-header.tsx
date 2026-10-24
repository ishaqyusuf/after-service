"use client";

import { Button } from "@afterservice/ui/button";
import { TableHead, TableHeader, TableRow } from "@afterservice/ui/table";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import type { Header, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo } from "react";
import { HorizontalPagination } from "@/components/horizontal-pagination";
import {
  ACTIONS_FULL_WIDTH_HEADER_CLASS,
  ACTIONS_STICKY_HEADER_CLASS,
  SORT_BUTTON_CLASS,
  TABLE_HEAD_CELL_CLASS,
  TABLE_HEADER_CLASS,
  type TableScrollState,
} from "@/components/tables/core";
import { DraggableHeader } from "@/components/tables/draggable-header";
import { ResizeHandle } from "@/components/tables/resize-handle";
import { useSortQuery } from "@/hooks/use-sort-query";
import { useStickyColumns } from "@/hooks/use-sticky-columns";
import {
  NON_REORDERABLE_COLUMNS,
  SORT_FIELD_MAPS,
  STICKY_COLUMNS,
} from "@/utils/table-configs";

interface Props<TData> {
  table?: Table<TData>;
  loading?: boolean;
  tableScroll?: TableScrollState;
}

export function DataTableHeader<TData>({
  table,
  loading,
  tableScroll,
}: Props<TData>) {
  const { sortColumn, sortValue, createSortQuery } = useSortQuery();

  // Use the reusable sticky columns hook
  const { getStickyStyle, getStickyClassName, isVisible } = useStickyColumns({
    table,
    loading,
    stickyColumns: STICKY_COLUMNS["follow-ups"],
  });

  // Get sortable column IDs (excluding sticky columns)
  const sortableColumnIds = useMemo(() => {
    if (!table) return [];
    return table
      .getAllLeafColumns()
      .filter((col) => !NON_REORDERABLE_COLUMNS["follow-ups"].has(col.id))
      .map((col) => col.id);
  }, [table]);

  if (!table) return null;

  const headerGroups = table.getHeaderGroups();

  return (
    <TableHeader className={TABLE_HEADER_CLASS}>
      {headerGroups.map((headerGroup) => (
        <TableRow
          key={headerGroup.id}
          className="h-[45px] hover:bg-transparent flex items-center !border-b-0 min-w-full"
        >
          <SortableContext
            items={sortableColumnIds}
            strategy={horizontalListSortingStrategy}
          >
            {headerGroup.headers.map((header, headerIndex, headers) => {
              const columnId = header.column.id;
              const meta = header.column.columnDef.meta as
                | { sticky?: boolean; className?: string }
                | undefined;
              const isSticky = meta?.sticky;
              const canReorder =
                !NON_REORDERABLE_COLUMNS["follow-ups"].has(columnId);
              const isActions = columnId === "actions";

              if (!isVisible(columnId)) return null;

              // Check if actions should be full width (no non-sticky visible columns)
              const hasNonStickyVisible = headers.some((h) => {
                if (h.column.id === "actions") return false;
                if (!isVisible(h.column.id)) return false;
                const hMeta = h.column.columnDef.meta as
                  | { sticky?: boolean }
                  | undefined;
                return !hMeta?.sticky;
              });
              const actionsFullWidth = isActions && !hasNonStickyVisible;

              // Check if this column should flex
              const isLastBeforeActions =
                headerIndex === headers.length - 2 &&
                headers[headers.length - 1]?.column.id === "actions";
              const shouldFlex =
                (isLastBeforeActions && !isSticky) || actionsFullWidth;

              const headerStyle = {
                width: actionsFullWidth ? undefined : header.getSize(),
                minWidth: actionsFullWidth
                  ? undefined
                  : isSticky
                    ? header.getSize()
                    : header.column.columnDef.minSize,
                maxWidth: actionsFullWidth
                  ? undefined
                  : isSticky
                    ? header.getSize()
                    : undefined,
                ...(!actionsFullWidth && getStickyStyle(columnId)),
                ...(shouldFlex && { flex: 1 }),
              };

              // Non-reorderable columns (sticky + actions)
              if (!canReorder) {
                const stickyClass = getStickyClassName(
                  columnId,
                  TABLE_HEAD_CELL_CLASS,
                );
                const finalClassName = isActions
                  ? actionsFullWidth
                    ? ACTIONS_FULL_WIDTH_HEADER_CLASS
                    : ACTIONS_STICKY_HEADER_CLASS
                  : `${stickyClass} z-10 md:shadow-[1px_0_0_hsl(var(--border))]`;

                return (
                  <TableHead
                    key={header.id}
                    className={finalClassName}
                    style={headerStyle}
                  >
                    {renderHeaderContent(
                      header,
                      columnId,
                      sortColumn,
                      sortValue,
                      createSortQuery,
                      tableScroll,
                    )}
                    <ResizeHandle header={header} />
                  </TableHead>
                );
              }

              // Draggable columns
              return (
                <DraggableHeader
                  key={header.id}
                  id={columnId}
                  style={headerStyle}
                >
                  <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                    {renderHeaderContent(
                      header,
                      columnId,
                      sortColumn,
                      sortValue,
                      createSortQuery,
                      tableScroll,
                    )}
                  </div>
                  <ResizeHandle header={header} />
                </DraggableHeader>
              );
            })}
          </SortableContext>
        </TableRow>
      ))}
    </TableHeader>
  );
}

function renderHeaderContent<TData>(
  header: Header<TData, unknown>,
  columnId: string,
  sortColumn: string | undefined,
  sortValue: string | undefined,
  createSortQuery: (name: string) => void,
  tableScroll?: TableScrollState,
) {
  const sortField = SORT_FIELD_MAPS["follow-ups"][columnId];

  // Actions column - static text
  if (columnId === "actions") {
    return (
      <span className="text-muted-foreground w-full text-center">Actions</span>
    );
  }

  // Customer identity column - not sortable server-side, carries horizontal pagination
  if (columnId === "customer") {
    return (
      <div className="flex items-center justify-between w-full overflow-hidden">
        <span className="min-w-0 truncate">{getHeaderLabel(columnId)}</span>
        {tableScroll?.isScrollable && (
          <HorizontalPagination
            canScrollLeft={tableScroll.canScrollLeft}
            canScrollRight={tableScroll.canScrollRight}
            onScrollLeft={tableScroll.scrollLeft}
            onScrollRight={tableScroll.scrollRight}
            className="hidden md:flex flex-shrink-0"
          />
        )}
      </div>
    );
  }

  // Default sortable header
  if (sortField) {
    const headerLabel = getHeaderLabel(columnId);
    return (
      <div className="w-full overflow-hidden">
        <SortButton
          label={headerLabel}
          sortField={sortField}
          currentSortColumn={sortColumn}
          currentSortValue={sortValue}
          onSort={createSortQuery}
        />
      </div>
    );
  }

  // Fallback - just render the header text
  return (
    <span className="truncate">{header.column.columnDef.header as string}</span>
  );
}

function SortButton({
  label,
  sortField,
  currentSortColumn,
  currentSortValue,
  onSort,
}: {
  label: string;
  sortField: string;
  currentSortColumn?: string;
  currentSortValue?: string;
  onSort: (field: string) => void;
}) {
  return (
    <Button
      className={SORT_BUTTON_CLASS}
      variant="ghost"
      onClick={(e) => {
        e.stopPropagation(); // Prevent drag when clicking sort
        onSort(sortField);
      }}
    >
      <span className="truncate">{label}</span>
      {sortField === currentSortColumn && currentSortValue === "asc" && (
        <>
          <ArrowDown size={14} aria-hidden />
          <span className="sr-only">, sorted ascending</span>
        </>
      )}
      {sortField === currentSortColumn && currentSortValue === "desc" && (
        <>
          <ArrowUp size={14} aria-hidden />
          <span className="sr-only">, sorted descending</span>
        </>
      )}
    </Button>
  );
}

function getHeaderLabel(columnId: string): string {
  const labels: Record<string, string> = {
    customer: "Customer",
    status: "Status",
    channel: "Channel",
    dueAt: "Due at",
    job: "Job",
    notes: "Notes",
    actions: "Actions",
  };
  return labels[columnId] || columnId;
}
