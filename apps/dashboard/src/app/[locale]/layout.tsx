import { cn } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "../globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  description: "The afterservice operator dashboard.",
  title: appMetadata.dashboardTitle,
};

const plannerDisplay = localFont({
  src: "../fonts/cal-sans.woff2",
  display: "swap",
  fallback: ["system-ui", "Arial"],
  preload: true,
  variable: "--font-display",
  weight: "400",
});

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className={cn("bg-background font-sans", plannerDisplay.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen overscroll-none bg-background text-foreground antialiased">
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
