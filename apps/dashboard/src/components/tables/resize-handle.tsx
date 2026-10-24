"use client";

import { cn } from "@afterservice/ui/cn";
import type { Header } from "@tanstack/react-table";

interface ResizeHandleProps<TData> {
  header: Header<TData, unknown>;
  className?: string;
}

export function ResizeHandle<TData>({
  header,
  className,
}: ResizeHandleProps<TData>) {
  if (!header.column.getCanResize()) {
    return null;
  }

  return (
    <hr
      tabIndex={0}
      aria-label={`Resize ${header.column.id} column`}
      aria-orientation="vertical"
      aria-valuenow={header.column.getSize()}
      aria-valuemin={header.column.columnDef.minSize ?? 20}
      aria-valuemax={header.column.columnDef.maxSize ?? 1000}
      onKeyDown={(event) => {
        if (event.key === "Home") {
          event.preventDefault();
          header.column.resetSize();
          return;
        }
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        event.stopPropagation();
        const min = header.column.columnDef.minSize ?? 20;
        const max = header.column.columnDef.maxSize ?? 1000;
        const width = Math.min(
          max,
          Math.max(
            min,
            header.column.getSize() + (event.key === "ArrowRight" ? 10 : -10),
          ),
        );
        header.getContext().table.setColumnSizing((sizes) => ({
          ...sizes,
          [header.column.id]: width,
        }));
      }}
      onDoubleClick={() => header.column.resetSize()}
      onMouseDown={(e) => {
        e.stopPropagation(); // Prevent drag from triggering
        header.getResizeHandler()(e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation(); // Prevent drag from triggering
        header.getResizeHandler()(e);
      }}
      onPointerDown={(e) => e.stopPropagation()} // Stop dnd-kit from capturing
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
        "bg-transparent transition-colors group-hover/header:bg-[color:var(--wp-line-2)] hover:bg-primary",
        header.column.getIsResizing() && "bg-primary",
        className,
      )}
      style={{
        transform: "translateX(50%)",
      }}
    />
  );
}
