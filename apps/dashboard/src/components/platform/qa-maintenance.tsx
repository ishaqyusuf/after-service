"use client";

import { Button } from "@afterservice/ui/button";
import { Checkbox } from "@afterservice/ui/checkbox";
import { Input } from "@afterservice/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/trpc/client";

export function QaMaintenance() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState("");
  const candidates = useQuery(trpc.qaMaintenance.candidates.queryOptions());
  const preview = useQuery(trpc.qaMaintenance.preview.queryOptions());
  const adopt = useMutation(
    trpc.qaMaintenance.adopt.mutationOptions({
      onSuccess: async () => {
        setSelected([]);
        await queryClient.invalidateQueries({
          queryKey: trpc.qaMaintenance.candidates.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.qaMaintenance.preview.queryKey(),
        });
      },
    }),
  );
  const purge = useMutation(trpc.qaMaintenance.start.mutationOptions());

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-medium">Candidate QA workspaces</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Adoption is explicit. Domain matching alone does not permit deletion.
        </p>
        <div className="mt-4 grid gap-3">
          {candidates.data?.map((candidate) => (
            <label
              className="flex items-center gap-3 text-sm"
              htmlFor={`qa-workspace-${candidate.id}`}
              key={candidate.id}
            >
              <Checkbox
                checked={selected.includes(candidate.id)}
                id={`qa-workspace-${candidate.id}`}
                onCheckedChange={(checked) =>
                  setSelected((current) =>
                    checked
                      ? [...current, candidate.id]
                      : current.filter((id) => id !== candidate.id),
                  )
                }
              />
              {candidate.name}
            </label>
          ))}
          {!candidates.data?.length && (
            <p className="text-sm text-muted-foreground">
              No candidates found.
            </p>
          )}
        </div>
        <Button
          className="mt-4"
          disabled={!selected.length || adopt.isPending}
          onClick={() => adopt.mutate({ workspaceIds: selected })}
          variant="outline"
        >
          Adopt selected as QA
        </Button>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-medium">Purge preview</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(preview.data?.counts ?? {}).map(([label, value]) => (
            <div className="rounded-lg border p-3" key={label}>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="mt-1 text-lg font-medium">{String(value)}</div>
            </div>
          ))}
        </div>
        {!!preview.data?.blockers.length && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Resolve {preview.data.blockers.length} live subscription blocker(s)
            before deletion.
          </p>
        )}
        <label className="mt-5 grid gap-2 text-sm" htmlFor="qa-confirmation">
          Type <strong>PURGE ALL QA DATA</strong> to continue.
          <Input
            id="qa-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>
        <Button
          className="mt-3"
          disabled={
            confirmation !== "PURGE ALL QA DATA" ||
            !preview.data?.previewToken ||
            !!preview.data.blockers.length ||
            purge.isPending
          }
          onClick={() =>
            preview.data?.previewToken &&
            purge.mutate({
              confirmation: "PURGE ALL QA DATA",
              previewToken: preview.data.previewToken,
            })
          }
          variant="destructive"
        >
          Permanently purge all QA data
        </Button>
      </section>
    </div>
  );
}
