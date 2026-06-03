import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";

type FilterKey = "status";

type FilterValue = {
  status: string;
};

interface FilterValueProps {
  key: FilterKey;
  value: FilterValue[FilterKey];
}

interface Props {
  filters: Partial<FilterValue>;
  onRemove: (filters: { [key: string]: null }) => void;
  statusFilters?: { id: string; name: string }[];
}

export function FilterList({ filters, onRemove, statusFilters }: Props) {
  const renderFilter = ({ key, value }: FilterValueProps) => {
    switch (key) {
      case "status": {
        if (!value) return null;
        return statusFilters?.find((filter) => filter.id === value)?.name;
      }
      default:
        return null;
    }
  };

  const handleOnRemove = (key: FilterKey) => {
    onRemove({ [key]: null });
  };

  return (
    <ul className="flex space-x-2">
      {Object.entries(filters)
        .filter(([key, value]) => value !== null)
        .map(([key, value]) => {
          const filterKey = key as FilterKey;
          return (
            <li key={key}>
              <Button
                className="h-9 px-2 bg-secondary hover:bg-secondary font-normal text-[#878787] flex space-x-1 items-center group rounded-none"
                onClick={() => handleOnRemove(filterKey)}
              >
                <Icons.Clear className="scale-0 group-hover:scale-100 transition-all w-0 group-hover:w-4" />
                <span>
                  {renderFilter({
                    key: filterKey,
                    value: value as FilterValue[FilterKey],
                  })}
                </span>
              </Button>
            </li>
          );
        })}
    </ul>
  );
}
