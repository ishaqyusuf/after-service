"use client";

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Textarea,
} from "@afterservice/ui";
import {
  archiveCustomerAction,
  updateCustomerAction,
} from "@/lib/dashboard-actions";
import { useState } from "react";

export function CustomerSheet({ customer }: { customer: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>Update customer details or archive this record.</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <form action={updateCustomerAction} className="space-y-4" onSubmit={() => setOpen(false)}>
            <input name="id" type="hidden" value={customer.id} />
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={customer.name} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                defaultValue={customer.email ?? ""}
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                name="companyName"
                defaultValue={customer.companyName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                name="tags"
                defaultValue={customer.tags?.join(", ")}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                name="notes"
                defaultValue={customer.notes ?? ""}
                className="h-32"
              />
            </div>
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>

          <form action={archiveCustomerAction} className="pt-4 border-t border-border">
            <input name="id" type="hidden" value={customer.id} />
            <Button type="submit" variant="destructive" className="w-full">
              Archive Customer
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
