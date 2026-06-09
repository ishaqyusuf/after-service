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
import { Label } from "@afterservice/ui/label";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useJobFilterParams } from "@/hooks/use-job-filter-params";
import { trpc } from "@/components/providers/trpc-provider";
import { FilterList } from "./filter-list";

const allowedStatuses = [
  { id: "completed", name: "Completed" },
  { id: "needs_follow_up", name: "Needs follow-up" },
  { id: "resolved", name: "Resolved" },
];

export function JobsSearchFilter() {
  const { filter, setFilter } = useJobFilterParams();
  const [input, setInput] = useState(filter.q ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: customersData } = trpc.customers.list.useQuery({
    includeArchived: false,
  });
  const customers = customersData?.items ?? [];
  const { data: jobsData } = trpc.serviceJobs.list.useQuery({});
  const categoryFilters = useMemo(() => {
    const categories = new Set<string>();

    for (const job of jobsData?.items ?? []) {
      if (job.serviceCategory) {
        categories.add(job.serviceCategory);
      }
    }

    return Array.from(categories)
      .sort((a, b) => a.localeCompare(b))
      .map((category) => ({ id: category, name: category }));
  }, [jobsData]);

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

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setFilter({ q: input.length > 0 ? input : null });
  };

  const validFilters = Object.fromEntries(
    Object.entries(filter).filter(([key]) => key !== "q"),
  );

  const hasValidFilters = Object.values(validFilters).some(
    (value) => value !== null,
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 items-start sm:items-center w-full">
        <form
          className="relative w-full sm:w-auto"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Icons.Search className="absolute pointer-events-none left-3 top-[11px]" />
          <Input
            ref={inputRef}
            placeholder="Search jobs..."
            className="pl-9 w-full sm:w-[350px] pr-8"
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
              className={cn(
                "absolute z-10 right-3 top-[10px] opacity-50 transition-opacity duration-300 hover:opacity-100",
                hasValidFilters && "opacity-100",
                isOpen && "opacity-100",
              )}
            >
              <Icons.Filter />
            </button>
          </DropdownMenuTrigger>
        </form>

        <FilterList
          filters={validFilters}
          onRemove={setFilter}
          statusFilters={allowedStatuses}
          categoryFilters={categoryFilters}
          customers={customers}
        />
      </div>

      <DropdownMenuContent
        className="w-[350px]"
        sideOffset={19}
        alignOffset={-11}
        side="bottom"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.Status className="mr-2 h-4 w-4" />
              <span>Status</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {allowedStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.id}
                    checked={filter.status === status.id}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) => {
                      setFilter({
                        status: checked ? status.id : null,
                      });
                    }}
                  >
                    {status.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.Category className="mr-2 h-4 w-4" />
              <span>Category</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0 max-h-[300px] overflow-y-auto"
              >
                {categoryFilters.length > 0 ? (
                  categoryFilters.map((category) => {
                    const current = Array.isArray(filter.categories)
                      ? filter.categories
                      : [];
                    const isChecked = current.includes(category.id);

                    return (
                      <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={isChecked}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => {
                          const next = isChecked
                            ? current.filter((id) => id !== category.id)
                            : [...current, category.id];

                          setFilter({
                            categories: next.length > 0 ? next : null,
                          });
                        }}
                      >
                        {category.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })
                ) : (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    No categories yet
                  </div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.Customers className="mr-2 h-4 w-4" />
              <span>Customers</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0 max-h-[300px] overflow-y-auto"
              >
                {customers.map((customer) => {
                  const isChecked =
                    Array.isArray(filter.customers) &&
                    filter.customers.includes(customer.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={customer.id}
                      checked={isChecked}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={() => {
                        const current = Array.isArray(filter.customers)
                          ? filter.customers
                          : [];
                        const next = isChecked
                          ? current.filter((id) => id !== customer.id)
                          : [...current, customer.id];
                        setFilter({
                          customers: next.length > 0 ? next : null,
                        });
                      }}
                    >
                      {customer.name}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.CalendarMonth className="mr-2 h-4 w-4" />
              <span>Completed date</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-3"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">From</Label>
                    <Input
                      type="date"
                      value={filter.start ?? ""}
                      onChange={(e) => {
                        setFilter({
                          start: e.target.value || null,
                        });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">To</Label>
                    <Input
                      type="date"
                      value={filter.end ?? ""}
                      onChange={(e) => {
                        setFilter({
                          end: e.target.value || null,
                        });
                      }}
                    />
                  </div>
                  {(filter.start || filter.end) && (
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground text-left"
                      onClick={() => {
                        setFilter({ start: null, end: null });
                      }}
                    >
                      Clear date range
                    </button>
                  )}
                </div>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
