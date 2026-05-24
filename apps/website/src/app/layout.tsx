import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  description: "After-service follow-up software for local operators.",
  title: "afterservice",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
