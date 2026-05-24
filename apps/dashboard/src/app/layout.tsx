import { dashboardNavItems } from "@afterservice/site-nav";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description: "The afterservice operator dashboard.",
  title: appMetadata.dashboardTitle,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <aside>
          <a href="/">{appMetadata.name}</a>
          <nav aria-label="Dashboard navigation">
            {dashboardNavItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
        <header>
          <span>Workspace setup pending</span>
          <a href="/settings">Settings</a>
        </header>
        {children}
      </body>
    </html>
  );
}
