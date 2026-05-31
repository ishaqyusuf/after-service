import { dashboardNavItems } from "@afterservice/site-nav";
import { Badge, BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@afterservice/ui/globals.css";

export const metadata: Metadata = {
  description: "The afterservice operator dashboard.",
  title: appMetadata.dashboardTitle,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-background text-foreground antialiased overflow-hidden">
        <aside className="flex flex-col w-64 border-r border-border bg-card/40">
          <div className="h-16 flex items-center px-6">
            <a href="/" className="inline-flex items-center">
              <BrandLogo name={appMetadata.name} />
            </a>
          </div>
          <nav aria-label="Dashboard navigation" className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {dashboardNavItems.map((item) => (
              <a 
                href={item.href} 
                key={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card/40 backdrop-blur">
            <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">
              Workspace setup pending
            </Badge>
            <a href="/settings" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Settings
            </a>
          </header>
          
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            <div className="mx-auto max-w-6xl w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
