import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "as-button",
        `as-button--${variant}`,
        `as-button--${size}`,
        className,
      )}
      type={type}
      {...props}
    />
  );
}
