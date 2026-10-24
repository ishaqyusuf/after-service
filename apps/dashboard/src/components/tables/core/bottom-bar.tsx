"use client";

import { Button } from "@afterservice/ui";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Portal } from "@/components/portal";

interface BottomBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback to deselect all items */
  onDeselect: () => void;
  /** Action buttons to render on the right side */
  children: ReactNode;
}

/**
 * Generic bottom bar for table multi-select actions
 * Appears at the bottom of the screen when items are selected
 */
export function BottomBar({
  selectedCount,
  onDeselect,
  children,
}: BottomBarProps) {
  const reduceMotion = useReducedMotion();

  return (
    <Portal>
      <motion.div
        className="pointer-events-none fixed inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center md:bottom-6"
        initial={reduceMotion ? false : { y: 100 }}
        animate={{ y: 0 }}
        exit={reduceMotion ? undefined : { y: 100 }}
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <section
          aria-label="Selected rows"
          className="pointer-events-auto flex min-h-12 w-full max-w-[560px] flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[color:var(--wp-line)] bg-[color:var(--wp-paper)] py-1.5 pl-4 pr-1.5 shadow-[var(--wp-shadow-pop)] sm:w-auto sm:min-w-[400px]"
        >
          <span
            className="wp-numerals text-sm font-semibold"
            aria-live="polite"
          >
            {selectedCount} selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-10 rounded-[10px] text-[color:var(--wp-ink-2)] hover:bg-[color:var(--wp-hover)] hover:text-foreground"
              onClick={onDeselect}
            >
              <span>Deselect all</span>
            </Button>

            {children}
          </div>
        </section>
      </motion.div>
    </Portal>
  );
}
