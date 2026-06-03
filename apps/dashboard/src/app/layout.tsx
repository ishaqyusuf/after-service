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

import { TRPCProvider } from "@/components/providers/trpc-provider";
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider";
import { GlobalModalsProvider } from "@/components/modals/global-modals-provider";
import { Provider as OpenPanelProvider } from "@afterservice/events/client";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <TRPCProvider>
          <GlobalSheetsProvider />
          <GlobalModalsProvider />
          <OpenPanelProvider />
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
