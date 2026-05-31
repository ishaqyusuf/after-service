import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { setDefaultTemplateAction } from "@/lib/dashboard-actions";
import { resolveTemplate } from "@/lib/dashboard-format";
import { TemplateSheet } from "../sheets/template-sheet";

export function TemplatesTable({ templates, workspace, sampleJob, sampleCustomer }: { templates: any[], workspace: any, sampleJob: any, sampleCustomer: any }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <div className="font-semibold">{template.name}</div>
                <div className="text-sm text-muted-foreground">{template.channel}</div>
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {resolveTemplate(template.body, {
                  businessName: workspace.name,
                  completionDate: sampleJob?.completedAt,
                  customerName: sampleCustomer?.name,
                  serviceName: sampleJob?.title,
                })}
              </TableCell>
              <TableCell>
                {template.isDefault ? (
                  <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Default</Badge>
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
                <TemplateSheet template={template} />
              </TableCell>
            </TableRow>
          ))}
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No templates created yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
