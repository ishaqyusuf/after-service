"use client";

import { LogEvents } from "@afterservice/events";
import { useClearIdentity, useTrack } from "@afterservice/events/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@afterservice/ui";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { ThemeSwitch } from "./theme-switch";

const subscribeHydration = () => () => {};

export function UserMenu({
  isExpanded,
  onOpenChange,
}: {
  isExpanded: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const { data: session } = useSession();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const user = hydrated ? session?.user : undefined;
  const displayName = user?.name || "Your account";
  const initial = user?.name?.charAt(0).toUpperCase() || "U";
  const clearIdentity = useClearIdentity();
  const track = useTrack();

  const handleSignOut = async () => {
    setIsPending(true);
    try {
      track({
        event: LogEvents.SignOut.name,
        channel: LogEvents.SignOut.channel,
      });
      const result = await signOut();
      if (result.error) {
        throw new Error(result.error.message ?? "Sign out failed.");
      }

      clearIdentity();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open account menu"
          className={`flex min-h-11 w-full rounded-xl px-3 py-2 items-center hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
              {initial}
            </AvatarFallback>
          </Avatar>
          {isExpanded && (
            <div className="ml-3 flex flex-col items-start overflow-hidden">
              <span className="max-w-full truncate text-sm font-medium leading-none">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground mt-1 truncate max-w-full">
                {user?.email}
              </span>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isExpanded ? "end" : "center"}
        side="right"
        className="w-56"
        sideOffset={16}
      >
        <DropdownMenuLabel className="truncate">
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex flex-row items-center justify-between px-2 py-1.5">
          <p className="text-xs">Theme</p>
          <ThemeSwitch />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
