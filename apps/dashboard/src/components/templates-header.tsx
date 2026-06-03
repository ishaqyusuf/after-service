"use client";

import { Button } from "@afterservice/ui";
import { Input } from "@afterservice/ui";
import { useTemplateParams } from "@/hooks/use-template-params";
import { useTemplateFilterParams } from "@/hooks/use-template-filter-params";
import { useDebounceValue } from "usehooks-ts";
import { useEffect, useState } from "react";

export function TemplatesHeader() {
  const { setParams } = useTemplateParams();
  const { filter, setFilter } = useTemplateFilterParams();
  const [inputValue, setInputValue] = useState(filter?.q || "");
  const [debouncedSearch] = useDebounceValue(inputValue, 300);

  useEffect(() => {
    setFilter({ q: debouncedSearch ? debouncedSearch : null });
  }, [debouncedSearch, setFilter]);

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search templates..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full sm:w-[350px]"
        />
      </div>

      <div className="flex space-x-2">
        <Button onClick={() => setParams({ createTemplate: true })}>
          Create template
        </Button>
      </div>
    </div>
  );
}
