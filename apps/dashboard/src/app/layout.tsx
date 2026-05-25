import { dashboardNavItems } from "@afterservice/site-nav";
import { Badge, BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  description: "The afterservice operator dashboard.",
  title: appMetadata.dashboardTitle,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <aside className="dashboard-sidebar">
          <a className="dashboard-brand" href="/">
            <BrandLogo name={appMetadata.name} />
          </a>
          <nav aria-label="Dashboard navigation" className="dashboard-nav">
            {dashboardNavItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        <header className="dashboard-topbar">
          <Badge tone="warning">Workspace setup pending</Badge>
          <a href="/settings">Settings</a>
        </header>
        {children}
      </body>
    </html>
  );
}
