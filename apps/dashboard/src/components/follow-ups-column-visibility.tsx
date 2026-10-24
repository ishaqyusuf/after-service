"use client";

import { Button } from "@afterservice/ui/button";
import { Checkbox } from "@afterservice/ui/checkbox";
import { Icons } from "@afterservice/ui/icons";
import { Label } from "@afterservice/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@afterservice/ui/popover";
import { TOOLBAR_CONTROL_CLASS } from "@/components/page-header";
import { useFollowUpsStore } from "@/store/follow-ups";

export function FollowUpsColumnVisibility() {
  const { columns } = useFollowUpsStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Show or hide columns"
          className={TOOLBAR_CONTROL_CLASS}
        >
          <Icons.Tune size={18} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[220px] rounded-xl p-0 shadow-[var(--wp-shadow-pop)]"
        align="end"
        sideOffset={8}
      >
        <p className="border-b border-border px-4 py-2.5 text-[13px] font-semibold">
          Columns
        </p>
        <div className="flex max-h-[400px] flex-col gap-1 overflow-auto p-2">
          {columns
            .filter(
              (column) =>
                column.columnDef.enableHiding !== false &&
                column.id !== "actions",
            )
            .map((column) => {
              const meta = column.columnDef.meta as
                | { headerLabel?: string }
                | undefined;
              const label =
                meta?.headerLabel ??
                column.columnDef.header?.toString() ??
                column.id;

              return (
                <div
                  key={column.id}
                  className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 hover:bg-accent"
                >
                  <Checkbox
                    id={`follow-ups-column-${column.id}`}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked === true)
                    }
                  />
                  <Label
                    htmlFor={`follow-ups-column-${column.id}`}
                    className="flex-1 cursor-pointer py-2 text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </Label>
                </div>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
