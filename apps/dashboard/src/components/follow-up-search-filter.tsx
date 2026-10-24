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
import { useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  followUpChannelLabels,
  followUpChannels,
  followUpStatuses,
  followUpStatusLabels,
  toFollowUpChannel,
  toFollowUpStatus,
  useFollowUpFilterParams,
} from "@/hooks/use-follow-up-filter-params";
import { DateRangeFilter } from "./date-range-filter";
import {
  FILTER_MENU_CLASS,
  FILTER_TRIGGER_ACTIVE_CLASS,
  FILTER_TRIGGER_CLASS,
  FilterList,
  SEARCH_FORM_CLASS,
  SEARCH_ICON_CLASS,
  SEARCH_INPUT_CLASS,
  SEARCH_ROW_CLASS,
} from "./filter-list";

export function FollowUpSearchFilter() {
  const { filter, setFilter } = useFollowUpFilterParams();
  const [input, setInput] = useState(filter.q ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const statusFilters = followUpStatuses.map((status) => ({
    id: status,
    name: followUpStatusLabels[status],
  }));
  const channelFilters = followUpChannels.map((channel) => ({
    id: channel,
    name: followUpChannelLabels[channel],
  }));

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

  const hasValidFilters =
    Boolean(toFollowUpChannel(filter.channel)) ||
    Boolean(toFollowUpStatus(filter.status)) ||
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
              aria-label="Search follow-ups by customer name"
              placeholder="Search by customer"
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
                aria-label="Filter follow-ups"
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
          statusFilters={statusFilters}
          channelFilters={channelFilters}
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
                {statusFilters?.map((status) => (
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
              <Icons.OutgoingMail className="mr-2 h-4 w-4" />
              <span>Channel</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                sideOffset={14}
                alignOffset={-4}
                className="p-0"
              >
                {channelFilters.map((channel) => (
                  <DropdownMenuCheckboxItem
                    key={channel.id}
                    checked={filter.channel === channel.id}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) => {
                      setFilter({
                        channel: checked ? channel.id : null,
                      });
                    }}
                  >
                    {channel.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Icons.CalendarMonth className="mr-2 h-4 w-4" />
              <span>Due date</span>
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
