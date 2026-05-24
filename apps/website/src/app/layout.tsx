import { websiteNavItems } from "@afterservice/site-nav";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description: appMetadata.description,
  title: appMetadata.title,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <a href="/">{appMetadata.name}</a>
          <nav aria-label="Website navigation">
            {websiteNavItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        {children}
        <footer>
          <span>{appMetadata.name}</span>
          <a href="/pricing">Pricing</a>
        </footer>
      </body>
    </html>
  );
}
