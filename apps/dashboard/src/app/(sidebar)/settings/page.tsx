import { Badge } from "@afterservice/ui";
import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { UpdateWorkspaceForm } from "@/components/forms/update-workspace-form";

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
      <div className="max-w-[800px] py-6">
        <header className="mb-8 flex flex-col gap-4">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-2 w-fit">
              Workspace
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
            <p className="max-w-2xl text-muted-foreground">
              Keep workspace identity and default follow-up cadence aligned with
              the operator&apos;s service workflow.
            </p>
          </div>
        </header>

        <UpdateWorkspaceForm />
      </div>
    </ErrorBoundary>
  );
}
