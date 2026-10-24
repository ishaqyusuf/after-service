import { getAdoptionExcludedWorkspaceIds } from "@afterservice/utils";
import { createServerAnalytics } from "@ishaqyusuf/logly-server";

type TrackOptions = {
  event: string;
  profileId?: string;
  workspaceId?: string;
} & Record<string, unknown>;

export const setupAnalytics = async () => {
  let excludedWorkspaceIds: Set<string>;
  try {
    excludedWorkspaceIds = new Set(
      getAdoptionExcludedWorkspaceIds(process.env),
    );
  } catch {
    // Optional analytics must never affect the product or send misclassified events.
    return { track: (_options: TrackOptions) => {} };
  }
  const collectorUrl = process.env.LOGLY_COLLECTOR_URL;
  const serverKey = process.env.LOGLY_SERVER_KEY;
  const enabled =
    process.env.LOGLY_ENABLED === "true" && Boolean(collectorUrl && serverKey);
  const client =
    enabled && collectorUrl && serverKey
      ? createServerAnalytics({
          collectorUrl,
          project: process.env.LOGLY_PROJECT ?? "afterservice",
          serverKey,
        })
      : null;

  return {
    track: (options: TrackOptions) => {
      if (
        !client ||
        (options.workspaceId && excludedWorkspaceIds.has(options.workspaceId))
      )
        return;
      const {
        event,
        profileId: _profileId,
        workspaceId: _workspaceId,
        ...properties
      } = options;
      client.track(event, properties).catch(() => {});
    },
  };
};
