import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { format, parseISO } from "date-fns";

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
          .map((id) => categoryFilters?.find((filter) => filter.id === id)?.name)
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
      case "end": {
        if (!value || typeof value !== "string") return null;
        const label = key === "start" ? "From" : "To";
        try {
          return `${label} ${format(parseISO(value), "MMM d, yyyy")}`;
        } catch {
          return `${label} ${value}`;
        }
      }
      default:
        return null;
    }
  };

  const handleOnRemove = (key: FilterKey) => {
    onRemove({ [key]: null });
  };

  return (
    <ul className="flex flex-wrap gap-2">
      {Object.entries(filters)
        .filter(([key, value]) => value !== null && value !== undefined)
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
                className="h-9 px-2 bg-secondary hover:bg-secondary font-normal text-[#878787] flex space-x-1 items-center group rounded-none"
                onClick={() => handleOnRemove(filterKey)}
              >
                <Icons.Clear className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4" />
                <span>{displayValue}</span>
              </Button>
            </li>
          );
        })}
    </ul>
  );
}
