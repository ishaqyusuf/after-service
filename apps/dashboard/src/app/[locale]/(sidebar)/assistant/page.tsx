import type { Metadata } from "next";
import { AssistantWorkspace } from "@/components/assistant/assistant-workspace";
export const metadata: Metadata = { title: "Assistant | afterservice" };
export default function AssistantPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="pb-4 pt-2">
        <h1 className="text-xl font-medium">Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your customers, completed work and next follow-ups.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <AssistantWorkspace />
      </div>
    </div>
  );
}
