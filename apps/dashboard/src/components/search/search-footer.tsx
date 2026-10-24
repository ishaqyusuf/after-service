"use client";

import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { useSearchStore } from "@/store/search";

export function SearchFooter() {
  const { setOpen } = useSearchStore();
  return (
    <div className="search-footer flex min-h-14 w-full shrink-0 items-center gap-3 border-t border-border bg-background px-3">
      <div className="scale-50 dark:opacity-50 -ml-1">
        <Icons.LogoSmall />
      </div>

      <div className="ml-auto hidden space-x-2 sm:flex" aria-hidden="true">
        <div className="size-6 select-none items-center border bg-accent flex justify-center">
          <Icons.ArrowUpward className="size-3 dark:text-[#666666] text-black" />
        </div>

        <div className="size-6 select-none items-center border bg-accent flex justify-center">
          <Icons.ArrowDownward className="size-3 dark:text-[#666666] text-black" />
        </div>

        <div className="size-6 select-none items-center border bg-accent flex justify-center">
          <Icons.SubdirectoryArrowLeft className="size-3 dark:text-[#666666] text-black" />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="ml-auto min-h-11 rounded-lg sm:ml-2"
        onClick={() => setOpen(false)}
      >
        Close search
      </Button>
    </div>
  );
}
