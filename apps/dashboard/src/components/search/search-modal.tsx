"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@afterservice/ui/dialog";
import { useHotkeys } from "react-hotkeys-hook";
import { useSearchStore } from "@/store/search";
import { Search } from "./search";
import { SearchFooter } from "./search-footer";

export function SearchModal() {
  const { isOpen, setOpen } = useSearchStore();

  useHotkeys("meta+k, ctrl+k", () => setOpen(), {
    enableOnFormTags: true,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className="m-0 h-[min(535px,calc(100dvh-2rem))] w-[calc(100%-2rem)] max-w-[740px] overflow-hidden rounded-2xl border border-border bg-background p-0 select-text"
        hideClose
      >
        <DialogTitle className="sr-only">Search pages</DialogTitle>
        <DialogDescription className="sr-only">
          Find a dashboard page and open it.
        </DialogDescription>
        {isOpen && (
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1">
              <Search />
            </div>
            <SearchFooter />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
