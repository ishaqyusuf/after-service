import { cn } from "@afterservice/ui";
import type { ReactNode } from "react";

export function SectionHeading({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        "wp-display max-w-[24ch] text-[clamp(28px,3.6vw,42px)] leading-[1.12] tracking-[-0.01em]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function SectionLede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-3.5 max-w-[62ch] text-[16.5px] leading-relaxed text-muted-foreground sm:text-lg",
        className,
      )}
    >
      {children}
    </p>
  );
}
