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
import {
  serviceJobStatuses,
  serviceJobStatusLabels,
  toServiceJobStatus,
  useJobFilterParams,
} from "@/hooks/use-job-filter-params";
import { useTRPC } from "@/trpc/client";
import { DateRangeFilter } from "./date-range-filter";
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

export function JobsSearchFilter() {
  const trpc = useTRPC();
  const { filter, setFilter } = useJobFilterParams();
  const [input, setInput] = useState(filter.q ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: customersData } = useQuery(
    trpc.customers.list.queryOptions({
      includeArchived: false,
      limit: 100,
    }),
  );
  const customers = customersData?.items ?? [];
  const { data: jobsData } = useQuery(
    trpc.serviceJobs.list.queryOptions({ limit: 100 }),
  );
  const allowedStatuses = serviceJobStatuses.map((status) => ({
    id: status,
    name: serviceJobStatusLabels[status],
  }));
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

  const selectedCategories = Array.isArray(filter.categories)
    ? filter.categories
    : [];
  const selectedCustomers = Array.isArray(filter.customers)
    ? filter.customers
    : [];
  const hasValidFilters =
    Boolean(toServiceJobStatus(filter.status)) ||
    selectedCategories.some((category) =>
      categoryFilters.some((filter) => filter.id === category),
    ) ||
    selectedCustomers.some((customerId) =>
      customers.some((customer) => customer.id === customerId),
    ) ||
    Boolean(filter.start) ||
    Boolean(filter.end);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <div className={SEARCH_ROW_CLASS}>
        <search className={SEARCH_FORM_CLASS}>
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Icons.Search className={SEARCH_ICON_CLASS} />
            <Input
              ref={inputRef}
              aria-label="Search jobs by title or customer"
              placeholder="Search jobs"
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
                aria-label="Filter jobs"
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

        <FilterList
          filters={validFilters}
          onRemove={setFilter}
          statusFilters={allowedStatuses}
          categoryFilters={categoryFilters}
          customers={customers}
        />
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
                  <FilterMenuEmptyState>No categories yet</FilterMenuEmptyState>
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
                {customers.length > 0 ? (
                  customers.map((customer) => {
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
                  })
                ) : (
                  <FilterMenuEmptyState>No customers yet</FilterMenuEmptyState>
                )}
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
                className="p-0"
              >
                <DateRangeFilter
                  start={filter.start}
                  end={filter.end}
                  onSelect={setFilter}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
