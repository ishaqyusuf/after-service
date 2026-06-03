import { useQueryStates } from "nuqs";
import { createLoader, parseAsString } from "nuqs/server";

const followUpFilterParamsSchema = {
  q: parseAsString,
  status: parseAsString,
};

export function useFollowUpFilterParams() {
  const [filter, setFilter] = useQueryStates(followUpFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}

export const loadFollowUpFilterParams = createLoader(followUpFilterParamsSchema);
