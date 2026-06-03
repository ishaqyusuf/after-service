import { useQueryStates } from "nuqs";
import { createLoader, parseAsString } from "nuqs/server";

const templateFilterParamsSchema = {
  q: parseAsString,
};

export function useTemplateFilterParams() {
  const [filter, setFilter] = useQueryStates(templateFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}

export const loadTemplateFilterParams = createLoader(templateFilterParamsSchema);
