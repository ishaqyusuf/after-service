import { getDbClient } from "@afterservice/db";
import {
  Notifications,
  type NotificationTypes,
} from "@afterservice/notifications";
import { logger, task } from "@trigger.dev/sdk/v3";

type NotificationTaskPayload = {
  [Type in keyof NotificationTypes]: {
    channels?: Array<"email" | "sms" | "whatsapp" | "phone">;
    payload: NotificationTypes[Type];
    sendEmail?: boolean;
    type: Type;
    workspaceId: string;
  };
}[keyof NotificationTypes];

export const notification = task({
  id: "notification",
  maxDuration: 60,
  queue: {
    concurrencyLimit: 5,
  },
  run: async (input: NotificationTaskPayload) => {
    const notifications = new Notifications(getDbClient());

    const result = await notifications.send(
      input.type,
      input.workspaceId,
      input.payload as never,
      {
        channels: input.channels,
        sendEmail: input.sendEmail ?? false,
      },
    );

    logger.info("Processed notification", {
      dispatches: result.dispatches,
      type: input.type,
      workspaceId: input.workspaceId,
    });

    return result;
  },
});
