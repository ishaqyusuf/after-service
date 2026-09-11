"use client";

import { Provider as AnalyticsProvider } from "@afterservice/events/client";
import type { ReactNode } from "react";
import { PwaServiceWorkerRegister } from "../components/pwa-service-worker-register";
import { TRPCReactProvider } from "../trpc/client";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <TRPCReactProvider>
      <AnalyticsProvider>
        <PwaServiceWorkerRegister />
        {children}
      </AnalyticsProvider>
    </TRPCReactProvider>
  );
}
