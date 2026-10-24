import type { Metadata } from "next";
import { ChangeTheme } from "@/components/change-theme";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { UpdateWorkspaceForm } from "@/components/forms/update-workspace-form";
import { ScrollableContent } from "@/components/scrollable-content";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Settings | afterservice",
  description: "Manage workspace settings.",
};

export default async function SettingsPage() {
  await prefetch(trpc.workspace.getCurrent.queryOptions());

  return (
    <HydrateClient>
      <ScrollableContent>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <div className="max-w-[800px] space-y-6">
            <header className="space-y-1.5">
              <h1 className="wp-display text-[26px] leading-tight md:text-[30px]">
                Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Your business details, follow-up defaults and appearance.
              </p>
            </header>
            <UpdateWorkspaceForm />
            <ChangeTheme />
          </div>
        </ErrorBoundary>
      </ScrollableContent>
    </HydrateClient>
  );
}
