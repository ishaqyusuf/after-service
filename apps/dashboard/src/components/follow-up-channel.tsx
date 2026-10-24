import { cn } from "@afterservice/ui/cn";
import { Mail, MessageCircle, MessageSquare, Phone } from "lucide-react";
import {
  followUpChannelLabels,
  toFollowUpChannel,
} from "@/hooks/use-follow-up-filter-params";

const channelIcons = {
  email: Mail,
  phone: Phone,
  sms: MessageSquare,
  whatsapp: MessageCircle,
} as const;

export function followUpChannelLabel(channel: string) {
  const value = toFollowUpChannel(channel);
  return value ? followUpChannelLabels[value] : channel;
}

export function ChannelIcon({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) {
  const value = toFollowUpChannel(channel);
  const Icon = value ? channelIcons[value] : MessageSquare;
  return (
    <Icon
      aria-hidden="true"
      className={cn("size-[15px] shrink-0", className)}
    />
  );
}

export function ChannelTag({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-muted-foreground",
        className,
      )}
    >
      <ChannelIcon channel={channel} />
      {followUpChannelLabel(channel)}
    </span>
  );
}
