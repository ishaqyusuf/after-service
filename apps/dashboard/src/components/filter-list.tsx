import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { format, parseISO } from "date-fns";
import type { ReactNode } from "react";

/** Shared Wall planner presentation for the domain search + filter controls. */
export const SEARCH_ROW_CLASS =
  "flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3";
export const SEARCH_FORM_CLASS =
  "relative w-full min-w-0 sm:w-[360px] sm:max-w-full";
export const SEARCH_ICON_CLASS =
  "pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground";
export const SEARCH_INPUT_CLASS =
  "h-11 w-full rounded-[10px] border-[color:var(--wp-line-2)] bg-[color:var(--wp-paper)] pl-10 pr-12 text-base transition-colors hover:border-[color:var(--wp-ink-3)] focus-visible:border-primary md:h-10 md:text-sm";
export const FILTER_TRIGGER_CLASS =
  "absolute right-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:size-8";
export const FILTER_TRIGGER_ACTIVE_CLASS =
  "bg-accent text-[color:var(--wp-teal-ink)]";
export const FILTER_MENU_CLASS =
  "w-[min(350px,calc(100vw-24px))] rounded-xl shadow-[var(--wp-shadow-pop)]";

type FilterKey =
  | "status"
  | "categories"
  | "customers"
  | "tags"
  | "channel"
  | "start"
  | "end";

type FilterValue = {
  status: string;
  categories: string[];
  customers: string[];
  tags: string[];
  channel: string;
  start: string;
  end: string;
};

interface FilterValueProps {
  key: FilterKey;
  value: FilterValue[FilterKey];
}

interface Props {
  filters: Partial<FilterValue>;
  onRemove: (filters: { [key: string]: null }) => void;
  statusFilters?: { id: string; name: string }[];
  categoryFilters?: { id: string; name: string }[];
  channelFilters?: { id: string; name: string }[];
  customers?: { id: string; name: string }[];
}

export function FilterList({
  filters,
  onRemove,
  statusFilters,
  categoryFilters,
  channelFilters,
  customers,
}: Props) {
  const renderFilter = ({ key, value }: FilterValueProps) => {
    switch (key) {
      case "status": {
        if (!value) return null;
        return statusFilters?.find((filter) => filter.id === value)?.name;
      }
      case "customers": {
        if (!Array.isArray(value) || value.length === 0) return null;
        const names = value
          .map((id) => customers?.find((c) => c.id === id)?.name)
          .filter(Boolean);
        if (names.length === 0) return null;
        if (names.length === 1) return names[0];
        return `${names[0]} +${names.length - 1} more`;
      }
      case "categories": {
        if (!Array.isArray(value) || value.length === 0) return null;
        const names = value
          .map(
            (id) => categoryFilters?.find((filter) => filter.id === id)?.name,
          )
          .filter(Boolean);
        if (names.length === 0) return null;
        if (names.length === 1) return names[0];
        return `${names[0]} +${names.length - 1} more`;
      }
      case "tags": {
        if (!Array.isArray(value) || value.length === 0) return null;
        if (value.length === 1) return value[0];
        return `${value[0]} +${value.length - 1} more`;
      }
      case "channel": {
        if (!value) return null;
        return channelFilters?.find((filter) => filter.id === value)?.name;
      }
      case "start":
        if (!value || typeof value !== "string") return null;
        if (filters.end) {
          try {
            return `${format(parseISO(value), "MMM d, yyyy")} - ${format(
              parseISO(filters.end),
              "MMM d, yyyy",
            )}`;
          } catch {
            return `${value} - ${filters.end}`;
          }
        }

        try {
          return `From ${format(parseISO(value), "MMM d, yyyy")}`;
        } catch {
          return `From ${value}`;
        }
      case "end": {
        if (!value || typeof value !== "string") return null;
        try {
          return `To ${format(parseISO(value), "MMM d, yyyy")}`;
        } catch {
          return `To ${value}`;
        }
      }
      default:
        return null;
    }
  };

  const handleOnRemove = (key: FilterKey) => {
    if (key === "start" || key === "end") {
      onRemove({ start: null, end: null });
      return;
    }

    onRemove({ [key]: null });
  };

  return (
    <ul className="flex flex-wrap gap-2 empty:hidden">
      {Object.entries(filters)
        .filter(
          ([key, value]) =>
            value !== null &&
            value !== undefined &&
            !(key === "end" && filters.start),
        )
        .map(([key, value]) => {
          const filterKey = key as FilterKey;
          const displayValue = renderFilter({
            key: filterKey,
            value: value as FilterValue[FilterKey],
          });
          if (!displayValue) return null;
          return (
            <li key={key}>
              <Button
                variant="outline"
                aria-label={`Remove filter: ${displayValue}`}
                className="h-9 gap-1.5 rounded-full border-[color:var(--wp-line-2)] bg-[color:var(--wp-paper)] pl-3 pr-2 text-[13px] font-medium text-[color:var(--wp-ink-2)] hover:border-primary hover:bg-[color:var(--wp-paper)] hover:text-[color:var(--wp-teal-ink)]"
                onClick={() => handleOnRemove(filterKey)}
              >
                <span>{displayValue}</span>
                <Icons.Clear className="size-4 shrink-0" />
              </Button>
            </li>
          );
        })}
    </ul>
  );
}

export function FilterMenuEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 py-1.5 text-xs text-muted-foreground">{children}</div>
  );
}
