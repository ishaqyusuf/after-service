import { Badge, Button } from "@afterservice/ui";
import { CreateTemplateForm } from "@/components/forms/create-template-form";
import { TemplatesTable } from "@/components/tables/templates-table";
import Link from "next/link";
import { Suspense } from "react";

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2">Message drafts</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage reusable follow-up drafts. Applying a template creates an
            editable draft; afterservice does not send messages automatically.
          </p>
        </div>
        <Button asChild>
          <Link href="/follow-ups">Use on board</Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        <CreateTemplateForm />

        <section className="min-w-0">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading templates...</div>}>
            <TemplatesTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

