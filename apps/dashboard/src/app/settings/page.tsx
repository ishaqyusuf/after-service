import {
  Badge,
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
} from "@afterservice/ui";
import { updateWorkspaceAction } from "@/lib/dashboard-actions";
import { getSettingsData } from "@/lib/dashboard-data";

export default async function SettingsPage() {
  const { workspace } = await getSettingsData();

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge>Workspace</Badge>
        <div>
          <h1>Settings</h1>
          <p>
            Keep workspace identity and default follow-up cadence aligned with
            the operator&apos;s service workflow.
          </p>
        </div>
      </header>

      <form action={updateWorkspaceAction} className="dashboard-form">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="settings-workspace-name">
              Workspace name
            </FieldLabel>
            <Input
              id="settings-workspace-name"
              name="name"
              defaultValue={workspace.name}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-business-type">
              Business type
            </FieldLabel>
            <Input
              id="settings-business-type"
              name="businessType"
              defaultValue={workspace.businessType ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-service-category">
              Service category
            </FieldLabel>
            <Input
              id="settings-service-category"
              name="serviceCategory"
              defaultValue={workspace.serviceCategory ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-follow-up-delay">
              Default follow-up delay
            </FieldLabel>
            <Select
              defaultValue={String(workspace.defaultFollowUpDelayDays)}
              id="settings-follow-up-delay"
              name="defaultFollowUpDelayDays"
            >
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </Select>
          </Field>
        </FieldGroup>
        <Button type="submit">Save settings</Button>
      </form>
    </main>
  );
}
