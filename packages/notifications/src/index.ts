import type { PrismaClient } from "@afterservice/db";
import type {
  EmailInput,
  NotificationHandler,
  NotificationOptions,
  NotificationResult,
  SmsInput,
  UserData,
  WhatsAppInput,
} from "./base";
import { type NotificationTypes, followUpScheduledSchema, followUpMessageSentSchema, jobCompletedCheckInSchema } from "./schemas";
import { followUpScheduled } from "./types/followup-scheduled";
import { followUpMessageSent } from "./types/followup-message-sent";
import { jobCompletedCheckIn } from "./types/job-completed-checkin";

const handlers = {
  followup_scheduled: followUpScheduled,
  followup_message_sent: followUpMessageSent,
  job_completed_checkin: jobCompletedCheckIn,
} as const;

export class Notifications {
  #db: PrismaClient;

  constructor(db: PrismaClient) {
    this.#db = db;
  }

  async send<T extends keyof NotificationTypes>(
    type: T,
    workspaceId: string,
    payload: NotificationTypes[T],
    options?: NotificationOptions,
  ): Promise<NotificationResult> {
    const handler = handlers[type] as unknown as NotificationHandler;

    if (!handler) {
      throw new Error(`Unknown notification type: ${String(type)}`);
    }

    try {
      // 1. Validate Payload
      const validatedData = handler.schema.parse(payload) as any;

      // 2. Fetch Team/Workspace Info
      const workspace = await this.#db.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
      });

      const teamContext = {
        id: workspace.id,
        name: workspace.name,
        defaultFollowUpDelayDays: workspace.defaultFollowUpDelayDays,
      };

      // 3. Prepare Activities and Dispatches
      const users = validatedData.users || [];
      const activitiesToCreate = [];
      
      const emailDispatches = [];
      const smsDispatches = [];
      const whatsappDispatches = [];

      for (const user of users) {
        // Record Activity
        const activityInput = handler.createActivity(validatedData, user);
        activitiesToCreate.push(activityInput);

        const channels = options?.channels || ["email"]; // default channel

        if (channels.includes("email") && handler.createEmail) {
          const emailInput = handler.createEmail(validatedData, user, teamContext);
          emailDispatches.push(emailInput);
        }

        if (channels.includes("sms") && handler.createSms) {
          const smsInput = handler.createSms(validatedData, user, teamContext);
          smsDispatches.push(smsInput);
        }

        if (channels.includes("whatsapp") && handler.createWhatsApp) {
          const whatsappInput = handler.createWhatsApp(validatedData, user, teamContext);
          whatsappDispatches.push(whatsappInput);
        }
      }

      // 4. Save Activities
      for (const activity of activitiesToCreate) {
        // Find existing follow up or job to tie event
        if (activity.metadata?.followUpId) {
          await this.#db.followUpEvent.create({
            data: {
              type: activity.type,
              workspaceId: activity.workspaceId,
              followUpId: activity.metadata.followUpId,
              metadata: activity.metadata,
              actorId: activity.actorId,
            }
          });
        }
      }

      // 5. Execute Dispatches (Mocked for now, to be replaced by actual Services)
      let emailsSent = 0;
      let emailsFailed = 0;
      let smsSent = 0;
      let smsFailed = 0;
      let whatsappSent = 0;
      let whatsappFailed = 0;

      // Log Emails
      for (const dispatch of emailDispatches) {
        await this.#db.messageLog.create({
          data: {
            workspaceId: workspaceId,
            customerId: dispatch.data?.customerId,
            followUpId: dispatch.data?.followUpId,
            channel: "email",
            recipient: dispatch.user.email,
            subject: dispatch.subject,
            body: typeof dispatch.data?.body === 'string' ? dispatch.data.body : JSON.stringify(dispatch.data),
            status: "sent",
            sentAt: new Date(),
          }
        });
        emailsSent++;
      }

      // Log SMS
      for (const dispatch of smsDispatches) {
        await this.#db.messageLog.create({
          data: {
            workspaceId: workspaceId,
            customerId: dispatch.data?.customerId,
            followUpId: dispatch.data?.followUpId,
            channel: "sms",
            recipient: dispatch.user.phone || dispatch.user.email,
            body: dispatch.body,
            status: "sent",
            sentAt: new Date(),
          }
        });
        smsSent++;
      }

      // Log WhatsApp
      for (const dispatch of whatsappDispatches) {
        await this.#db.messageLog.create({
          data: {
            workspaceId: workspaceId,
            customerId: dispatch.data?.customerId,
            followUpId: dispatch.data?.followUpId,
            channel: "whatsapp",
            recipient: dispatch.user.phone || dispatch.user.email,
            body: dispatch.body,
            status: "sent",
            sentAt: new Date(),
          }
        });
        whatsappSent++;
      }

      return {
        type: String(type),
        activities: activitiesToCreate.length,
        dispatches: {
          email: { sent: emailsSent, failed: emailsFailed },
          sms: { sent: smsSent, failed: smsFailed },
          whatsapp: { sent: whatsappSent, failed: whatsappFailed },
        },
      };
    } catch (error) {
      console.error(`Failed to send notification ${type}:`, error);
      throw error;
    }
  }
}

export type {
  EmailInput,
  NotificationHandler,
  NotificationOptions,
  NotificationResult,
  UserData,
  SmsInput,
  WhatsAppInput,
} from "./base";
export type { NotificationTypes } from "./schemas";
