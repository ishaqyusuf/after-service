import { QaMaintenance } from "@/components/platform/qa-maintenance";

export default function QaMaintenancePage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">QA maintenance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover, adopt, preview, and permanently remove explicitly marked QA
          workspaces.
        </p>
      </header>
      <QaMaintenance />
    </main>
  );
}
