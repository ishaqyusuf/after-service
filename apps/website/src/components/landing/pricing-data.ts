export type PublicPlan = {
  billingNote: string;
  buyer: string;
  cta: string;
  current?: boolean;
  description: string;
  features: string[];
  limits: string[];
  name: string;
  planned?: boolean;
  price: string;
  priceNote: string;
};

export const publicPlans = [
  {
    billingNote: "No credit card required.",
    buyer: "Early service operators",
    cta: "Join free beta",
    current: true,
    description:
      "Use the core follow-up board while afterservice is in early access.",
    features: [
      "Customers and completed jobs",
      "Follow-up board",
      "Basic templates",
      "Manual send logging",
    ],
    limits: ["1 owner/admin", "100 customers", "200 follow-ups", "5 templates"],
    name: "Free Beta",
    price: "$0",
    priceNote: "during early access",
  },
  {
    billingNote: "Planned after beta.",
    buyer: "Solo owner/operator",
    cta: "Planned after beta",
    description:
      "A simple paid plan for shops that want the core workflow with more room.",
    features: [
      "Core board and templates",
      "CSV import",
      "Manual email/SMS logging",
      "Basic reports",
    ],
    limits: ["1 user", "250 customers", "750 follow-ups", "10 templates"],
    name: "Starter",
    planned: true,
    price: "$29",
    priceNote: "per month planned",
  },
  {
    billingNote: "Planned after beta.",
    buyer: "Small service team",
    cta: "Planned after beta",
    description:
      "For shops with an office/admin workflow and multiple people touching follow-up.",
    features: [
      "Team assignment",
      "Saved follow-up sequences",
      "Provider integrations",
      "Recurring maintenance reminders",
    ],
    limits: [
      "Up to 5 users",
      "2,000 customers",
      "7,500 follow-ups",
      "50 templates",
    ],
    name: "Shop",
    planned: true,
    price: "$79",
    priceNote: "per month planned",
  },
  {
    billingNote: "Planned after beta.",
    buyer: "Growing local operator",
    cta: "Planned after beta",
    description:
      "For higher-volume operators that need automations, imports, and reporting.",
    features: [
      "Automation rules",
      "Zapier/webhook import",
      "QuickBooks/job-source helpers",
      "Priority support",
    ],
    limits: [
      "Up to 15 users",
      "10,000 customers",
      "30,000 follow-ups",
      "150 templates",
    ],
    name: "Growth",
    planned: true,
    price: "$149",
    priceNote: "per month planned",
  },
] satisfies PublicPlan[];
