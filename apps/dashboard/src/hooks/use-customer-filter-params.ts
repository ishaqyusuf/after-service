import { useQueryStates } from "nuqs";
import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
} from "nuqs/server";

const customerFilterParamsSchema = {
  q: parseAsString,
  tags: parseAsArrayOf(parseAsString),
};

export function useCustomerFilterParams() {
  const [filter, setFilter] = useQueryStates(customerFilterParamsSchema);

  return {
    filter,
    setFilter,
    hasFilters: Object.values(filter).some((value) => value !== null),
  };
}

export const loadCustomerFilterParams = createLoader(customerFilterParamsSchema);
