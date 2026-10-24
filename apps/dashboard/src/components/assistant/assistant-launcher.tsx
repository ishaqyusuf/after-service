"use client";
import { Button } from "@afterservice/ui";
import { Maximize2, MessageCircle, Minimize2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAssistant } from "./assistant-provider";
import { AssistantWorkspace } from "./assistant-workspace";
export function AssistantLauncher() {
  const a = useAssistant();
  const pathname = usePathname();
  const launcher = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (!a.open && wasOpen.current) launcher.current?.focus();
    wasOpen.current = a.open;
  }, [a.open]);
  useEffect(() => {
    if (!a.open) return;
    function key(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !document.querySelector('[role="dialog"]')
      ) {
        a.setOpen(false);
        launcher.current?.focus();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [a.open, a.setOpen]);
  if (!a.enabled || pathname === "/assistant") return null;
  return (
    <>
      {
        <section
          aria-label="afterservice assistant"
          className={`fixed z-[70] ${a.open ? "flex" : "hidden"} flex-col overflow-hidden border bg-background shadow-xl inset-0 md:inset-auto md:bottom-24 md:right-6 md:rounded-lg ${a.expanded ? "md:w-[min(880px,calc(100vw-110px))] md:h-[min(760px,calc(100dvh-130px))]" : "md:w-[440px] md:h-[min(640px,calc(100dvh-130px))]"}`}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b px-4">
            <span className="text-sm font-medium">afterservice assistant</span>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="hidden md:inline-flex"
                aria-label={
                  a.expanded ? "Compact assistant" : "Expand assistant"
                }
                onClick={() => a.setExpanded(!a.expanded)}
              >
                {a.expanded ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Minimize assistant"
                onClick={() => {
                  a.setOpen(false);
                  launcher.current?.focus();
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <AssistantWorkspace compact />
        </section>
      }
      <Button
        ref={launcher}
        size="icon"
        aria-label={a.open ? "Minimize assistant" : "Open assistant"}
        aria-expanded={a.open}
        className={`fixed bottom-5 right-5 z-[71] size-12 rounded-full shadow-lg ${a.open ? "hidden md:inline-flex" : ""}`}
        onClick={() => a.setOpen(!a.open)}
      >
        <MessageCircle className="size-5" />
      </Button>
    </>
  );
}
export function AskAssistantButton({
  kind,
  id,
  label,
  onOpen,
}: {
  kind: "customers" | "jobs" | "followUps";
  id: string;
  label: string;
  onOpen?: () => void;
}) {
  const a = useAssistant();
  if (!a.enabled) return null;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        a.setInput(
          `Help me with ${label}. Find the ${kind} record with ID ${id} before making any suggestions.`,
        );
        a.setOpen(true);
        onOpen?.();
      }}
    >
      <MessageCircle className="mr-2 size-4" />
      Ask assistant
    </Button>
  );
}
