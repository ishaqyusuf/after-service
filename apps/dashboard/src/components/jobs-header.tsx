"use client";

import { Button } from "@afterservice/ui";
import { Input } from "@afterservice/ui";
import { useJobParams } from "@/hooks/use-job-params";
import { useJobFilterParams } from "@/hooks/use-job-filter-params";
import { useDebounceValue } from "usehooks-ts";
import { useEffect, useState } from "react";

export function JobsHeader() {
  const { setParams } = useJobParams();
  const { filter, setFilter } = useJobFilterParams();
  const [inputValue, setInputValue] = useState(filter?.q || "");
  const [debouncedSearch] = useDebounceValue(inputValue, 300);

  useEffect(() => {
    setFilter({ q: debouncedSearch ? debouncedSearch : null });
  }, [debouncedSearch, setFilter]);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search jobs..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full sm:w-[350px]"
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={() => setParams({ createJob: true })}>
          Log job
        </Button>
      </div>
    </div>
  );
}
