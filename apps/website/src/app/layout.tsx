import { websiteNavItems } from "@afterservice/site-nav";
import { BrandLogo, cn } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { ReactNode } from "react";
import "@afterservice/ui/globals.css";
import Link from "next/link";
import { Provider as AnalyticsProvider } from "@afterservice/events/client";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  description: appMetadata.description,
  title: appMetadata.title,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("font-sans antialiased", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <AnalyticsProvider />
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <BrandLogo name={appMetadata.name} />
            </Link>
            <nav
              aria-label="Website navigation"
              className="hidden md:flex items-center space-x-6 text-sm font-medium"
            >
              {websiteNavItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.href}
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border bg-muted/40">
          <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <BrandLogo name={appMetadata.name} />
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link
                href="/pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
