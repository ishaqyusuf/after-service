import type { ColumnDef } from "@tanstack/react-table";
import type { RefObject } from "react";
import type { TableId } from "@/utils/table-settings";

/**
 * Skeleton types for rendering loading states
 */
export type SkeletonType =
  | "checkbox"
  | "text"
  | "avatar-text"
  | "icon-text"
  | "badge"
  | "tags"
  | "icon";

/**
 * Scroll state for horizontal table scrolling
 * Used by table headers to show horizontal pagination
 */
export interface TableScrollState {
  containerRef: RefObject<HTMLDivElement | null>;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isScrollable: boolean;
  scrollLeft: () => void;
  scrollRight: () => void;
}

/**
 * Sticky column configuration
 */
export interface StickyColumnConfig {
  id: string;
  width: number;
}

/**
 * Configuration for a table type
 */
export interface TableConfig {
  tableId: TableId;
  stickyColumns: StickyColumnConfig[];
  sortFieldMap: Record<string, string>;
  nonReorderableColumns: Set<string>;
  rowHeight: number;
  summaryGridHeight?: number;
}

/**
 * Configuration for skeleton rendering in column meta
 */
export interface SkeletonConfig {
  /** Type of skeleton to render */
  type: SkeletonType;
  /** Optional Tailwind width class (e.g., "w-20", "w-40") */
  width?: string;
}

/**
 * Extended column meta interface with skeleton support
 */
export interface TableColumnMeta {
  className?: string;
  sticky?: boolean;
  sortField?: string;
  skeleton?: SkeletonConfig;
  headerLabel?: string;
}

/**
 * Get column ID from a TanStack Table column definition
 * Works with both `id` and `accessorKey` columns
 */
export function getColumnId<T>(col: ColumnDef<T>): string {
  return col.id || (col as { accessorKey?: string }).accessorKey || "";
}

/**
 * Get header label from column meta or format the column ID
 */
export function getHeaderLabel<T>(col: ColumnDef<T>): string {
  const meta = col.meta as TableColumnMeta | undefined;
  if (meta?.headerLabel) {
    return meta.headerLabel;
  }

  // Format column ID as title case
  const id = getColumnId(col);
  return id
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Shared Wall planner header cell look: ground band, ruled bottom, no column dividers.
 */
export const TABLE_HEAD_CELL_CLASS =
  "group/header relative h-full px-4 flex items-center border-r-0 border-b border-border bg-[color:var(--wp-ground)] text-[12.5px] font-semibold text-[color:var(--wp-ink-2)] whitespace-nowrap";

/**
 * Sortable header label button
 */
export const SORT_BUTTON_CLASS =
  "h-8 min-w-0 max-w-full gap-1.5 rounded-md px-0 text-[12.5px] font-semibold text-[color:var(--wp-ink-2)] hover:bg-transparent hover:text-foreground";

/**
 * Header row band (sticky at the top of the scroll viewport)
 */
export const TABLE_HEADER_CLASS =
  "border-0 block sticky top-0 z-20 bg-[color:var(--wp-ground)] w-full";

/**
 * Actions column class when it should be full width (no sticky, no left border)
 */
export const ACTIONS_FULL_WIDTH_HEADER_CLASS = `${TABLE_HEAD_CELL_CLASS} justify-center z-10`;

/**
 * Actions column class when sticky to the right. Sticky at every width so the
 * header stays aligned with the always-sticky actions cells on phones.
 */
export const ACTIONS_STICKY_HEADER_CLASS = `${TABLE_HEAD_CELL_CLASS} justify-center sticky right-0 z-10 shadow-[-1px_0_0_hsl(var(--border))]`;

/**
 * Sticky identity column body cell (left) and actions body cell (right)
 */
export const IDENTITY_CELL_CLASS =
  "md:sticky md:left-0 bg-background group-hover:bg-[color:var(--wp-hover)] z-20 md:shadow-[1px_0_0_hsl(var(--border))]";
export const ACTIONS_CELL_CLASS =
  "sticky right-0 justify-center text-center bg-background group-hover:bg-[color:var(--wp-hover)] z-30 shadow-[-1px_0_0_hsl(var(--border))]";

/**
 * Actions cell class when it should be full width
 */
export const ACTIONS_FULL_WIDTH_CELL_CLASS =
  "bg-background group-hover:bg-[color:var(--wp-hover)]";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends import("@tanstack/react-table").RowData> {
    archiveCustomer?: (id: string) => void;
    archiveTemplate?: (id: string) => void;
    closeFollowUp?: (id: string) => void;
    scheduleFollowUp?: (id: string) => void;
  }
}
