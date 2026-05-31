import { Button, Input, Label } from "@afterservice/ui";
import { updateWorkspaceAction } from "@/lib/dashboard-actions";

export function UpdateWorkspaceForm({ workspace }: { workspace: any }) {
  return (
    <form action={updateWorkspaceAction} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm max-w-xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-workspace-name">Workspace name</Label>
          <Input
            id="settings-workspace-name"
            name="name"
            defaultValue={workspace.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-business-type">Business type</Label>
          <Input
            id="settings-business-type"
            name="businessType"
            defaultValue={workspace.businessType ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-service-category">Service category</Label>
          <Input
            id="settings-service-category"
            name="serviceCategory"
            defaultValue={workspace.serviceCategory ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-follow-up-delay">Default follow-up delay</Label>
          <select
            defaultValue={String(workspace.defaultFollowUpDelayDays)}
            id="settings-follow-up-delay"
            name="defaultFollowUpDelayDays"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
