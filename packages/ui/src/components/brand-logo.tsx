import * as React from "react";
import { cn } from "../utils";

export function BrandLogo({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-foreground leading-none", className)}>
      <svg
        className="w-7 h-7 shrink-0"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="15" cy="15" r="15" fill="currentColor" />
        <circle cx="15" cy="15" r="6" className="fill-[#009b98]" />
      </svg>
      <span className="tracking-tight font-bold text-lg">{name}</span>
    </div>
  );
}
