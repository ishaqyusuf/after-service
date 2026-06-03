"use client";

import {
  OpenPanelComponent,
  type TrackProperties,
  useOpenPanel,
} from "@openpanel/nextjs";

const isProd = process.env.NODE_ENV === "production";

const Provider = () => (
  <OpenPanelComponent
    clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID!}
    trackAttributes={true}
    trackScreenViews={isProd}
    trackOutgoingLinks={isProd}
  />
);

type TrackOptions = { event: string } & TrackProperties;

const useTrack = () => {
  const { track: openTrack } = useOpenPanel();

  return (options: TrackOptions) => {
    if (!isProd) {
      console.log("Track", options);
      return;
    }

    const { event, ...rest } = options;

    openTrack(event, rest);
  };
};

export { Provider, useTrack };
