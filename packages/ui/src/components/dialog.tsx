import type { DialogHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export type DialogProps = DialogHTMLAttributes<HTMLDialogElement> & {
  description?: ReactNode;
  title: ReactNode;
};

export function Dialog({
  children,
  className,
  description,
  title,
  ...props
}: DialogProps) {
  return (
    <dialog className={cn("as-dialog", className)} {...props}>
      <header>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </dialog>
  );
}
