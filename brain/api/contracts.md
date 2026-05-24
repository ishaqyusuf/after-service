# API Contracts

## Purpose
This file records contract standards and planned request/response shapes.

## Contract Rules
- Use schema validation for all external input.
- Return workspace-scoped records only.
- Prefer stable IDs and ISO date strings over ambiguous date formats.
- Keep provider payloads out of dashboard responses unless needed.

## Common Response Patterns
List responses:
```ts
type ListResult<T> = {
  items: T[];
  nextCursor?: string | null;
};
```

Mutation responses:
```ts
type MutationResult<T> = {
  item: T;
};
```

## Domain DTOs
Customer summary:
```ts
type CustomerSummary = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  lastServiceAt?: string | null;
  openFollowUpCount: number;
};
```

Follow-up board item:
```ts
type FollowUpItem = {
  id: string;
  customerName: string;
  channel: "email" | "sms" | "phone" | "whatsapp";
  dueAt: string;
  status: "open" | "scheduled" | "sent" | "replied" | "closed" | "missed";
  serviceTitle?: string | null;
};
```

## Billing Contract
Checkout creation returns:
```ts
type CheckoutResult = {
  checkoutUrl: string;
};
```

Webhook processing must store:
- provider event ID
- event type
- raw payload
- processing status
- related workspace if resolvable
