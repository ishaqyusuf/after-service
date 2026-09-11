"use client";

import {
  AnalyticsProvider,
  useAnalytics,
  useTrack as useLoglyTrack,
} from "@ishaqyusuf/logly-next";
import type { ReactNode } from "react";

const enabled = process.env.NEXT_PUBLIC_LOGLY_ENABLED === "true";

const Provider = ({ children }: { children: ReactNode }) => (
  <AnalyticsProvider
    project={process.env.NEXT_PUBLIC_LOGLY_PROJECT ?? "afterservice"}
    endpoint={process.env.NEXT_PUBLIC_LOGLY_ENDPOINT ?? "/api/analytics"}
    disabled={!enabled}
    respectPrivacySignals
  >
    {children}
  </AnalyticsProvider>
);

type TrackOptions = { event: string } & Record<string, unknown>;

const useTrack = () => {
  const track = useLoglyTrack();

  return (options: TrackOptions) => {
    const { event, ...rest } = options;
    return track(event, rest);
  };
};

const useClearIdentity = () => {
  const { reset } = useAnalytics();
  return reset;
};

export { Provider, useClearIdentity, useTrack };
