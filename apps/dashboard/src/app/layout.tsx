import { Provider as OpenPanelProvider } from "@afterservice/events/client";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@afterservice/ui/globals.css";
import { GlobalModalsProvider } from "@/components/modals/global-modals-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { GlobalSheetsProvider } from "@/components/sheets/global-sheets-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  description: "The afterservice operator dashboard.",
  title: appMetadata.dashboardTitle,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            <GlobalSheetsProvider />
            <GlobalModalsProvider />
            <OpenPanelProvider />
            {children}
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
