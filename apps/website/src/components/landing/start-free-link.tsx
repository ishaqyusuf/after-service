"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { Button, cn } from "@afterservice/ui";
import Link from "next/link";
import type { ReactNode } from "react";

type StartFreeLinkProps = {
  children?: ReactNode;
  className?: string;
  location: string;
  onNavigate?: () => void;
  size?: "default" | "lg";
  tone?: "primary" | "inverse";
};

export function StartFreeLink({
  children = "Start free",
  className,
  location,
  onNavigate,
  size = "default",
  tone = "primary",
}: StartFreeLinkProps) {
  const track = useTrack();

  return (
    <Button
      asChild
      className={cn(
        "rounded-[10px] font-semibold",
        size === "lg"
          ? "h-[50px] px-[22px] text-base"
          : "h-11 px-[18px] text-[15px]",
        tone === "inverse" &&
          "bg-primary-foreground text-accent-foreground hover:bg-primary-foreground/90",
        className,
      )}
    >
      <Link
        href="/signup"
        onClick={() => {
          onNavigate?.();
          track({
            event: LogEvents.JoinFreeBeta.name,
            channel: LogEvents.JoinFreeBeta.channel,
            location,
          });
        }}
      >
        {children}
      </Link>
    </Button>
  );
}
