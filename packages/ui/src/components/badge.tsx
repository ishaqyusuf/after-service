import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning";
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("as-badge", `as-badge--${tone}`, className)}
      {...props}
    />
  );
}
