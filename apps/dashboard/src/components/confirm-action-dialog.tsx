"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  buttonVariants,
} from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import type { ReactNode } from "react";

type ConfirmActionDialogProps = {
  children: ReactNode;
  confirmLabel: string;
  description: ReactNode;
  onConfirm: () => void;
  title: string;
};

// Short destructive confirmations stay in an AlertDialog; full editors stay
// in sheets. The trigger is passed as the child element.
export function ConfirmActionDialog({
  children,
  confirmLabel,
  description,
  onConfirm,
  title,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[455px] rounded-[14px] bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-[family-name:var(--font-display)] text-xl">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="h-11 sm:h-9">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "h-11 sm:h-9",
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
