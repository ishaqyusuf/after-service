import { Provider as OpenPanelProvider } from "@afterservice/events/client";
import { cn } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import { Hedvig_Letters_Sans, Hedvig_Letters_Serif } from "next/font/google";
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

const hedvigSans = Hedvig_Letters_Sans({
  adjustFontFallback: true,
  display: "optional",
  fallback: ["system-ui", "arial"],
  preload: true,
  subsets: ["latin"],
  variable: "--font-hedvig-sans",
  weight: "400",
});

const hedvigSerif = Hedvig_Letters_Serif({
  adjustFontFallback: true,
  display: "optional",
  fallback: ["Georgia", "Times New Roman", "serif"],
  preload: true,
  subsets: ["latin"],
  variable: "--font-hedvig-serif",
  weight: "400",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-background font-sans",
        hedvigSans.variable,
        hedvigSerif.variable,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-screen overscroll-none bg-background text-foreground antialiased">
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
