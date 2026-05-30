import { websiteNavItems } from "@afterservice/site-nav";
import { BrandLogo, cn } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  description: appMetadata.description,
  title: appMetadata.title,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <header className="site-header">
          <a className="site-brand" href="/">
            <BrandLogo name={appMetadata.name} />
          </a>
          <nav aria-label="Website navigation" className="site-nav">
            {websiteNavItems.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <span className="site-brand">
            <BrandLogo name={appMetadata.name} />
          </span>
          <a href="/pricing">Pricing</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </footer>
      </body>
    </html>
  );
}
