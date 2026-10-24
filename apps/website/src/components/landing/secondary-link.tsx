import { Button, cn } from "@afterservice/ui";
import Link from "next/link";
import type { ReactNode } from "react";

export function SecondaryLink({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className?: string;
  href: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "h-11 rounded-[10px] border-input bg-card px-[18px] text-[15px] font-semibold text-foreground",
        className,
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
