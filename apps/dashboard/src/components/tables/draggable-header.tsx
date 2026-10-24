"use client";

import { cn } from "@afterservice/ui/cn";
import { TableHead } from "@afterservice/ui/table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { TABLE_HEAD_CELL_CLASS } from "@/components/tables/core/types";

interface DraggableHeaderProps {
  id: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

export function DraggableHeader({
  id,
  children,
  className,
  style,
  disabled = false,
}: DraggableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
  });

  const dragStyle: CSSProperties = {
    // Use Translate instead of Transform to avoid scaling content
    transform: CSS.Translate.toString(transform),
    transition,
    ...style,
  };

  return (
    <TableHead
      ref={setNodeRef}
      className={cn(
        TABLE_HEAD_CELL_CLASS,
        "select-none shadow-none outline-none ring-0 focus:shadow-none focus:outline-none focus:ring-0 hover:shadow-none",
        isDragging &&
          "z-50 rounded-md border border-[color:var(--wp-line-2)] bg-[color:var(--wp-paper)] shadow-[var(--wp-shadow)]",
        className,
      )}
      style={dragStyle}
    >
      <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
      {!disabled && (
        <GripVertical
          size={14}
          aria-label="Drag to reorder column"
          className="ml-1 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover/header:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        />
      )}
    </TableHead>
  );
}
