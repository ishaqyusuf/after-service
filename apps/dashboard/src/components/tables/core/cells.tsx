"use client";

import { Button } from "@afterservice/ui/button";
import { cn } from "@afterservice/ui/cn";
import {
  Mail,
  MessageCircle,
  MessageSquareText,
  MoreHorizontal,
  Phone,
} from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

/** Sticky identity cell content. A real button so rows open from the keyboard. */
export function IdentityCell({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      className="block max-w-full truncate rounded-md text-left font-semibold text-foreground transition-colors hover:text-[color:var(--wp-teal-ink)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

/** Keeps clicks on nested controls from also opening the row's sheet. */
export function StopRowClick({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper only stops bubbling from the interactive child.
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation of the child fires the same click event.
    <span
      className={cn("inline-flex min-w-0 max-w-full", className)}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </span>
  );
}

export function EmptyCell() {
  return (
    <span className="text-muted-foreground">
      <span aria-hidden>—</span>
      <span className="sr-only">Not set</span>
    </span>
  );
}

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
  sms: MessageSquareText,
  whatsapp: MessageCircle,
};

export function ChannelLabel({
  channel,
  label,
}: {
  channel: string;
  label: string;
}) {
  const Icon = channelIcons[channel];

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-[color:var(--wp-ink-2)]">
      {Icon ? <Icon className="size-[15px] shrink-0" aria-hidden /> : null}
      <span>{label}</span>
    </span>
  );
}

/** Row "more" trigger for the sticky actions column. */
export const RowActionsTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button> & { label: string }
>(function RowActionsTrigger({ label, className, ...props }, ref) {
  return (
    <Button
      ref={ref}
      variant="ghost"
      aria-label={label}
      className={cn(
        "size-9 rounded-[10px] p-0 text-[color:var(--wp-ink-2)] hover:bg-[color:var(--wp-hover)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring data-[state=open]:bg-accent data-[state=open]:text-[color:var(--wp-teal-ink)] md:size-8",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="size-4" />
    </Button>
  );
});
