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
  templateChannelLabels,
  templateChannels,
  toTemplateChannel,
  useTemplateFilterParams,
} from "@/hooks/use-template-filter-params";
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

export function TemplatesSearchFilter() {
  const { filter, setFilter } = useTemplateFilterParams();
  const [input, setInput] = useState(filter.q ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const channelFilters = templateChannels.map((channel) => ({
    id: channel,
    name: templateChannelLabels[channel],
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

  const handleSubmit = (evt?: React.FormEvent) => {
    evt?.preventDefault();
    setFilter({ q: input.length > 0 ? input : null });
  };

  const validFilters = Object.fromEntries(
    Object.entries(filter).filter(([key]) => key !== "q"),
  );

  const hasValidFilters = Boolean(toTemplateChannel(filter.channel));

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
              aria-label="Search templates by name"
              placeholder="Search templates"
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
                aria-label="Filter templates"
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
                    onSelect={(evt) => evt.preventDefault()}
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
