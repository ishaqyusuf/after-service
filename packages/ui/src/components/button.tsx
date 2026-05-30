import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

const buttonVariants = cva("as-button", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "as-button--default-size",
      icon: "as-button--icon",
      sm: "as-button--sm",
    },
    variant: {
      default: "as-button--default",
      destructive: "as-button--destructive",
      ghost: "as-button--ghost",
      link: "as-button--link",
      outline: "as-button--outline",
      secondary: "as-button--secondary",
    },
  },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    size?: "default" | "icon" | "sm";
    variant?:
      | "default"
      | "destructive"
      | "ghost"
      | "link"
      | "outline"
      | "secondary";
  };

export function buttonVariantClasses({
  className,
  size,
  variant,
}: VariantProps<typeof buttonVariants> & { className?: string }) {
  return cn(buttonVariants({ size, variant }), className);
}

export function Button({
  asChild = false,
  className,
  size,
  type = "button",
  variant,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={buttonVariantClasses({ className, size, variant })}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}
