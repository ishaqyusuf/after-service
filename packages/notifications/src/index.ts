export type FollowUpChannel = "email" | "phone" | "sms" | "whatsapp";

export type FollowUpMessage = {
  body: string;
  channel: FollowUpChannel;
  customerId: string;
  followUpId: string;
  recipient: string;
  subject?: string | null;
  workspaceId: string;
};

export type MessageProviderResult = {
  providerId?: string;
  status: "sent" | "queued" | "failed";
};

export type MessageProvider = {
  send: (message: FollowUpMessage) => Promise<MessageProviderResult>;
};

export class MessagingNotConfiguredError extends Error {
  constructor() {
    super("Outbound messaging is not configured for this workspace.");
    this.name = "MessagingNotConfiguredError";
  }
}

export const manualOnlyProvider: MessageProvider = {
  async send() {
    throw new MessagingNotConfiguredError();
  },
};
