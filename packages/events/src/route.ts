import { createAnalyticsRoute } from "@ishaqyusuf/logly-next";

export const POST = createAnalyticsRoute({
  collectorUrl: process.env.LOGLY_COLLECTOR_URL,
  projectKey: process.env.LOGLY_PROJECT_KEY,
});
