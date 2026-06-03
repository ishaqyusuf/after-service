import { useQueryStates } from "nuqs";
import { createLoader, parseAsString } from "nuqs/server";

const jobFilterParamsSchema = {
  q: parseAsString,
  status: parseAsString,
};

export function useJobFilterParams() {
  const [filter, setFilter] = useQueryStates(jobFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}

export const loadJobFilterParams = createLoader(jobFilterParamsSchema);
