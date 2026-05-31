import { Badge } from "@afterservice/ui";
import { getSettingsData } from "@/lib/dashboard-data";
import { UpdateWorkspaceForm } from "@/components/forms/update-workspace-form";

export default async function SettingsPage() {
  const { workspace } = await getSettingsData();

  return (
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
        <UpdateWorkspaceForm workspace={workspace} />
      </section>
    </div>
  );
}

