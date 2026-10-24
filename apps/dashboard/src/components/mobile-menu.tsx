"use client";

import { BrandLogo } from "@afterservice/ui";
import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { Sheet, SheetClose, SheetContent } from "@afterservice/ui/sheet";
import { X } from "lucide-react";
import { useState } from "react";
import { MainMenu } from "./main-menu";

export function MobileMenu() {
  const [isOpen, setOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={() => setOpen(true)}
        className="size-11 shrink-0 rounded-[10px] text-[color:var(--wp-ink-2)] hover:bg-[color:var(--wp-hover)] hover:text-foreground md:hidden"
      >
        <Icons.Menu size={20} />
      </Button>
      <SheetContent
        side="left"
        title="Menu"
        className="flex flex-col rounded-none border-0 bg-[color:var(--wp-rail)] p-0 dark:bg-[color:var(--wp-rail)]"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[color:var(--wp-line)] pl-[18px] pr-2">
          <BrandLogo name="afterservice" />
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              className="size-11 rounded-[10px] text-[color:var(--wp-ink-2)] hover:bg-[color:var(--wp-hover)] hover:text-foreground"
            >
              <X className="size-5" />
            </Button>
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <MainMenu isExpanded size="drawer" onSelect={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
