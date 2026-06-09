import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";

const jobFilterParamsSchema = {
  q: parseAsString,
  categories: parseAsArrayOf(parseAsString),
  customers: parseAsArrayOf(parseAsString),
  status: parseAsString,
  start: parseAsString,
  end: parseAsString,
};

export function useJobFilterParams() {
  const [filter, setFilter] = useQueryStates(jobFilterParamsSchema, {
    clearOnDefault: true,
  });

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}

export const loadJobFilterParams = createLoader(jobFilterParamsSchema);
