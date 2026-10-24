"use client";

import { cn } from "@afterservice/ui/cn";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@afterservice/ui/dropdown-menu";
import { Icons } from "@afterservice/ui/icons";
import { Input } from "@afterservice/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useCustomerFilterParams } from "@/hooks/use-customer-filter-params";
import { useTRPC } from "@/trpc/client";
import {
  FILTER_MENU_CLASS,
  FILTER_TRIGGER_ACTIVE_CLASS,
  FILTER_TRIGGER_CLASS,
  FilterList,
  FilterMenuEmptyState,
  SEARCH_FORM_CLASS,
  SEARCH_ICON_CLASS,
  SEARCH_INPUT_CLASS,
  SEARCH_ROW_CLASS,
} from "./filter-list";

export function CustomersSearchFilter() {
  const trpc = useTRPC();
  const { filter, setFilter } = useCustomerFilterParams();
  const [input, setInput] = useState(filter.q ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery(
    trpc.customers.list.queryOptions({
      includeArchived: false,
      limit: 100,
    }),
  );
  const tagOptions = useMemo(() => {
    const tags = new Set<string>();

    for (const customer of data?.items ?? []) {
      for (const tag of customer.tags ?? []) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [data]);

  useHotkeys(
    "esc",
    () => {
      setInput("");
      setFilter(null);
      setIsOpen(false);
    },
    {
      enableOnFormTags: true,
      enabled: Boolean(input),
    },
  );

  useHotkeys("meta+s", (evt) => {
    evt.preventDefault();
    inputRef.current?.focus();
  });

  const handleSearch = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;

    if (value) {
      setInput(value);
    } else {
      setFilter({ q: null });
      setInput("");
    }
  };

  const handleSubmit = (evt?: React.FormEvent) => {
    evt?.preventDefault();
    setFilter({ q: input.length > 0 ? input : null });
  };

  const validFilters = Object.fromEntries(
    Object.entries(filter).filter(([key]) => key !== "q"),
  );

  const selectedTags = Array.isArray(filter.tags) ? filter.tags : [];
  const hasValidFilters = selectedTags.some((tag) => tagOptions.includes(tag));

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className={SEARCH_ROW_CLASS}>
        <search className={SEARCH_FORM_CLASS}>
          <form
            className="relative"
            onSubmit={(evt) => {
              evt.preventDefault();
              handleSubmit();
            }}
          >
            <Icons.Search className={SEARCH_ICON_CLASS} />
            <Input
              ref={inputRef}
              aria-label="Search customers by name, company, email, phone or tag"
              placeholder="Search customers"
              className={SEARCH_INPUT_CLASS}
              value={input}
              onChange={handleSearch}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />

            <DropdownMenuTrigger asChild>
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                type="button"
                aria-label="Filter customers"
                className={cn(
                  FILTER_TRIGGER_CLASS,
                  (hasValidFilters || isOpen) && FILTER_TRIGGER_ACTIVE_CLASS,
                )}
              >
                <Icons.Filter />
              </button>
            </DropdownMenuTrigger>
          </form>
        </search>

        <FilterList filters={validFilters} onRemove={setFilter} />
      </div>

      <DropdownMenuContent
        className={FILTER_MENU_CLASS}
        sideOffset={19}
        alignOffset={-11}
        side="bottom"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.Status className="mr-2 h-4 w-4" />
              <span>Tags</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="max-h-[300px] overflow-y-auto p-0"
              >
                {tagOptions.length > 0 ? (
                  tagOptions.map((tag) => {
                    const selectedTags = Array.isArray(filter.tags)
                      ? filter.tags
                      : [];
                    const isChecked = selectedTags.includes(tag);

                    return (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={isChecked}
                        onSelect={(evt) => evt.preventDefault()}
                        onCheckedChange={() => {
                          const next = isChecked
                            ? selectedTags.filter((item) => item !== tag)
                            : [...selectedTags, tag];

                          setFilter({
                            tags: next.length > 0 ? next : null,
                          });
                        }}
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    );
                  })
                ) : (
                  <FilterMenuEmptyState>No tags yet</FilterMenuEmptyState>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
