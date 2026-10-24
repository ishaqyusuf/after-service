"use client";

import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { useSearchStore } from "@/store/search";

export function OpenSearchButton() {
  const { setOpen } = useSearchStore();

  return (
    <Button
      variant="outline"
      data-track="Search Opened"
      aria-label="Search or jump to a page"
      aria-keyshortcuts="Meta+K"
      className="no-drag relative size-11 shrink-0 rounded-[10px] border-transparent bg-transparent p-0 font-normal text-[color:var(--wp-ink-2)] hover:bg-[color:var(--wp-hover)] hover:text-foreground md:h-10 md:w-full md:max-w-[340px] md:justify-start md:gap-2 md:border-[color:var(--wp-line-2)] md:bg-[color:var(--wp-paper)] md:px-3 md:text-muted-foreground md:hover:border-[color:var(--wp-ink-3)] md:hover:bg-[color:var(--wp-paper)]"
      onClick={() => setOpen()}
    >
      <Icons.Search size={18} className="shrink-0" />
      <span className="hidden truncate text-sm md:inline">
        Search or jump to…
      </span>
      <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-0.5 rounded-md border border-[color:var(--wp-line)] bg-[color:var(--wp-ground)] px-1.5 text-[11px] font-medium text-[color:var(--wp-ink-3)] lg:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
