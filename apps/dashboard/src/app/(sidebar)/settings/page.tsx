import { Badge } from "@afterservice/ui";
import { UpdateWorkspaceForm } from "@/components/forms/update-workspace-form";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Settings | After Service",
    description: "Manage workspace settings.",
  };
}

export default async function SettingsPage() {
  // TODO: Add trpc prefetch here when ready
  // await trpc.workspace.get.prefetch();

  return (
    <ErrorBoundary>
      <div className="space-y-8">
      <header className="flex flex-col gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2 w-fit">Workspace</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground max-w-2xl">
            Keep workspace identity and default follow-up cadence aligned with
            the operator&apos;s service workflow.
          </p>
        </div>
      </header>

      <section>
        <UpdateWorkspaceForm />
      </section>
    </div>
    </ErrorBoundary>
  );
}

