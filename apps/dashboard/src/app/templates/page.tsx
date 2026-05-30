import {
  Badge,
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@afterservice/ui";
import {
  archiveTemplateAction,
  createTemplateAction,
  setDefaultTemplateAction,
  updateTemplateAction,
} from "@/lib/dashboard-actions";
import { getTemplatesData, resolveTemplate } from "@/lib/dashboard-data";

export default async function TemplatesPage() {
  const { sampleCustomer, sampleJob, templates, workspace } =
    await getTemplatesData();

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge>Message drafts</Badge>
        <div>
          <h1>Templates</h1>
          <p>
            Manage reusable follow-up drafts. Applying a template creates an
            editable draft; afterservice does not send messages automatically.
          </p>
        </div>
        <a href="/follow-ups">Use on board</a>
      </header>

      <section className="dashboard-split">
        <form action={createTemplateAction} className="dashboard-form">
          <h2>Create template</h2>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="template-name">Name</FieldLabel>
              <Input id="template-name" name="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="template-channel">Channel</FieldLabel>
              <Select id="template-channel" name="channel" defaultValue="email">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="template-subject">Subject</FieldLabel>
              <Input id="template-subject" name="subject" />
            </Field>
            <Field>
              <FieldLabel htmlFor="template-body">Body</FieldLabel>
              <Textarea
                id="template-body"
                name="body"
                required
                defaultValue="Hi {{customer_name}}, checking in after {{service_name}}."
              />
            </Field>
            <Field>
              <label className="checkbox-label">
                <input name="isDefault" type="checkbox" /> Set as default
              </label>
            </Field>
          </FieldGroup>
          <Button type="submit">Create template</Button>
        </form>

        <section className="dashboard-section">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <strong>{template.name}</strong>
                    <span className="muted-block">{template.channel}</span>
                  </TableCell>
                  <TableCell>
                    {resolveTemplate(template.body, {
                      businessName: workspace.name,
                      completionDate: sampleJob?.completedAt,
                      customerName: sampleCustomer?.name,
                      serviceName: sampleJob?.title,
                    })}
                  </TableCell>
                  <TableCell>
                    {template.isDefault ? (
                      <Badge tone="success">Default</Badge>
                    ) : (
                      <form action={setDefaultTemplateAction}>
                        <input name="id" type="hidden" value={template.id} />
                        <Button size="sm" type="submit" variant="secondary">
                          Set default
                        </Button>
                      </form>
                    )}
                  </TableCell>
                  <TableCell>
                    <details className="inline-details">
                      <summary>Edit</summary>
                      <form action={updateTemplateAction} className="mini-form">
                        <input name="id" type="hidden" value={template.id} />
                        <Input name="name" defaultValue={template.name} />
                        <Select name="channel" defaultValue={template.channel}>
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                          <option value="phone">Phone</option>
                          <option value="whatsapp">WhatsApp</option>
                        </Select>
                        <Input
                          name="subject"
                          defaultValue={template.subject ?? ""}
                        />
                        <Textarea name="body" defaultValue={template.body} />
                        <label className="checkbox-label">
                          <input
                            defaultChecked={template.isDefault}
                            name="isDefault"
                            type="checkbox"
                          />{" "}
                          Default
                        </label>
                        <Button size="sm" type="submit">
                          Save
                        </Button>
                      </form>
                      <form action={archiveTemplateAction}>
                        <input name="id" type="hidden" value={template.id} />
                        <Button size="sm" type="submit" variant="ghost">
                          Delete
                        </Button>
                      </form>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </section>
    </main>
  );
}
