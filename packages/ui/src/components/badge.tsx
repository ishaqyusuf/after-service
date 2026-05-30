import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

const badgeVariants = cva("as-badge", {
  defaultVariants: {
    variant: "secondary",
  },
  variants: {
    variant: {
      destructive: "as-badge--destructive",
      outline: "as-badge--outline",
      secondary: "as-badge--secondary",
      success: "as-badge--success",
      warning: "as-badge--warning",
    },
  },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    tone?: "neutral" | "success" | "warning";
  };

export function Badge({ className, tone, variant, ...props }: BadgeProps) {
  const resolvedVariant =
    variant ?? (tone === "success" || tone === "warning" ? tone : "secondary");

  return (
    <span
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  );
}
