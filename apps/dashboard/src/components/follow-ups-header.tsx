"use client";

import { Button } from "@afterservice/ui";
import { Input } from "@afterservice/ui";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useFollowUpFilterParams } from "@/hooks/use-follow-up-filter-params";
import { useDebounceValue } from "usehooks-ts";
import { useEffect, useState } from "react";

export function FollowUpsHeader() {
  const { setParams } = useFollowUpParams();
  const { filter, setFilter } = useFollowUpFilterParams();
  const [inputValue, setInputValue] = useState(filter?.q || "");
  const [debouncedSearch] = useDebounceValue(inputValue, 300);

  useEffect(() => {
    setFilter({ q: debouncedSearch ? debouncedSearch : null });
  }, [debouncedSearch, setFilter]);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search follow-ups..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full sm:w-[350px]"
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={() => setParams({ createFollowUp: true })}>
          Create follow-up
        </Button>
      </div>
    </div>
  );
}
