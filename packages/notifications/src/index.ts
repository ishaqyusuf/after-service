export type FollowUpChannel = "email" | "phone" | "sms" | "whatsapp";

export type FollowUpMessage = {
  body: string;
  channel: FollowUpChannel;
  customerId: string;
  followUpId: string;
  workspaceId: string;
};
