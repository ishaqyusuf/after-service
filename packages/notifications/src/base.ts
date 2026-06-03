import { z } from "zod";
import type { PrismaClient } from "@afterservice/db";

export interface TeamContext {
  id: string;
  name: string;
  defaultFollowUpDelayDays: number;
}

export interface UserData {
  id: string;
  full_name?: string;
  email: string;
  phone?: string;
  workspace_id: string;
}

export interface CreateActivityInput {
  workspaceId: string;
  followUpId?: string;
  actorId?: string;
  type: string;
  metadata?: Record<string, any>;
}

export type EmailInput = {
  template?: string;
  user: UserData;
  data: Record<string, any>;
  subject: string;
  from?: string;
};

export type SmsInput = {
  user: UserData;
  data: Record<string, any>;
  body: string;
};

export type WhatsAppInput = {
  user: UserData;
  data: Record<string, any>;
  body: string;
};

export interface NotificationHandler<T = any> {
  schema: z.ZodSchema<T>;
  createActivity: (data: T, user: UserData) => CreateActivityInput;
  createEmail?: (
    data: T,
    user: UserData,
    team: TeamContext,
  ) => EmailInput;
  createSms?: (
    data: T,
    user: UserData,
    team: TeamContext,
  ) => SmsInput;
  createWhatsApp?: (
    data: T,
    user: UserData,
    team: TeamContext,
  ) => WhatsAppInput;
}

export type NotificationOptions = {
  priority?: number;
  channels?: Array<"email" | "sms" | "whatsapp">;
};

export interface NotificationResult {
  type: string;
  activities: number;
  dispatches: {
    email: { sent: number; failed: number };
    sms: { sent: number; failed: number };
    whatsapp: { sent: number; failed: number };
  };
}
