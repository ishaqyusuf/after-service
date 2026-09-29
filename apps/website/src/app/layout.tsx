import { cn } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { LandingFooter } from "../components/landing/footer";
import { LandingHeader } from "../components/landing/header";
import { createPageMetadata, siteUrl } from "../lib/seo";
import { Providers } from "./providers";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-regular.ttf",
  display: "swap",
  variable: "--font-hedvig-sans",
});

const calSans = localFont({
  src: "./fonts/cal-sans.woff2",
  display: "swap",
  variable: "--font-hedvig-serif",
});

export const metadata: Metadata = {
  ...createPageMetadata({
    description:
      "Free beta for local service operators who need one board for post-job customer follow-up.",
    path: "/",
    title: "afterservice | Post-job follow-up board for service shops",
  }),
  applicationName: appMetadata.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: appMetadata.name,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(siteUrl),
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("font-sans antialiased", inter.variable, calSans.variable)}
      suppressHydrationWarning
    >
      <body className="care-site min-h-screen flex flex-col bg-background text-foreground">
        <Providers>
          <LandingHeader />

          <div className="flex-1">{children}</div>

          <LandingFooter />
        </Providers>
      </body>
    </html>
  );
}
