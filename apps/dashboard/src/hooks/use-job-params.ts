import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export function useJobParams() {
  const [params, setParams] = useQueryStates({
    createJob: parseAsBoolean,
    jobId: parseAsString,
    editJob: parseAsBoolean,
  });

  return {
    ...params,
    setParams,
  };
}
