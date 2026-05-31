"use client";

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
import { resolveTemplate } from "@/lib/dashboard-format";
import { trpc } from "@/components/providers/trpc-provider";
import Link from "next/link";

export function TemplatesTable() {
  const { data, isLoading } = trpc.templates.list.useQuery();
  const utils = trpc.useUtils();
  
  const setDefaultMutation = trpc.templates.setDefault.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading templates...</div>;
  }

  const templates = data?.items ?? [];
  const workspace = data?.workspace;
  const sampleJob = data?.sampleJob;
  const sampleCustomer = data?.sampleCustomer;

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
                  businessName: workspace?.name ?? "Business",
                  completionDate: sampleJob?.completedAt,
                  customerName: sampleCustomer?.name,
                  serviceName: sampleJob?.title,
                })}
              </TableCell>
              <TableCell>
                {template.isDefault ? (
                  <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Default</Badge>
                ) : (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => setDefaultMutation.mutate({ id: template.id })}
                    disabled={setDefaultMutation.isPending}
                  >
                    Set default
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <Link href={`?template_id=${template.id}`} scroll={false} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Edit
                </Link>
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
