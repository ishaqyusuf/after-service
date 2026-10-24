"use client";

import { SheetClose, SheetContent } from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useId, useRef } from "react";

type DashboardSheetContentProps = {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  // Replaces the default title block, e.g. the follow-up sheet header.
  header?: ReactNode;
  title: string;
};

// Shared sheet frame: the shared SheetContent stays untouched; this wrapper
// adds the visible title, a reachable close button and a scrolling body.
export function DashboardSheetContent({
  bodyClassName = "pt-6",
  children,
  className,
  description,
  header,
  title,
}: DashboardSheetContentProps) {
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const hasDescription = !header && Boolean(description);

  return (
    <SheetContent
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        openerRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        closeRef.current?.focus();
      }}
      onCloseAutoFocus={(event) => {
        const opener = openerRef.current;
        const target =
          opener?.isConnected && opener !== document.body
            ? opener
            : document.getElementById("main-content");
        if (target) {
          event.preventDefault();
          target.focus();
        }
      }}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={cn("flex flex-col bg-card p-0 dark:bg-card", className)}
      title={title}
    >
      <div className="flex shrink-0 items-start gap-3 border-b border-border px-3.5 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))] sm:px-5 sm:pb-4 sm:pt-[18px]">
        <div className="grid min-w-0 flex-1 gap-[3px]">
          {header ?? (
            <>
              <h2 className="break-words font-[family-name:var(--font-display)] text-2xl leading-[1.15]">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </>
          )}
        </div>
        <SheetClose
          ref={closeRef}
          aria-label="Close"
          className="-mr-1 -mt-1 inline-grid size-11 shrink-0 place-items-center rounded-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:size-[38px]"
        >
          <X aria-hidden="true" className="size-[18px]" />
        </SheetClose>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 pb-[calc(3rem+env(safe-area-inset-bottom))] sm:px-5 sm:pb-10",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </SheetContent>
  );
}
