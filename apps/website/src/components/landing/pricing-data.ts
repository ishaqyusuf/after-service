import type { PublicPlanId } from "@afterservice/plans";

type PlanFeature = {
  name: string;
  description?: string;
  comingSoon?: boolean;
};

type PublicPlan = {
  billingNote: string;
  buyer: string;
  cta: string;
  current: boolean;
  description: string;
  features: PlanFeature[];
  id: PublicPlanId;
  limits: string[];
  name: string;
  priceNote: string;
};

export const publicPlans: PublicPlan[] = [
  {
    billingNote: "No credit card required.",
    buyer: "Getting started",
    cta: "Start free",
    current: true,
    description:
      "Keep your customers, completed jobs and follow-ups in one place.",
    features: [
      { name: "Customers and completed jobs" },
      { name: "Follow-up board" },
      { name: "Basic templates" },
      { name: "Manual contact logging and history" },
    ],
    limits: [
      "1 user",
      "100 stored customers",
      "200 stored follow-ups",
      "5 templates",
    ],
    id: "free_beta",
    name: "Free",
    priceNote: "per month",
  },
  {
    billingNote: "Billed monthly. Cancel from your billing portal.",
    buyer: "Small service team",
    cta: "Choose Business",
    current: false,
    description:
      "More room for your business, with AI assistance and WhatsApp operations on the way.",
    features: [
      { name: "Everything in Free" },
      {
        name: "AI operations assistant",
        description:
          "Find customers, record jobs, manage follow-ups and draft messages in chat.",
        comingSoon: true,
      },
      {
        name: "Run your business from WhatsApp",
        description:
          "Connect your WhatsApp to afterservice, then review and confirm supported operations directly in chat.",
        comingSoon: true,
      },
    ],
    limits: [
      "Up to 3 users",
      "1,000 stored customers",
      "3,000 stored follow-ups",
      "25 templates",
    ],
    id: "business",
    name: "Business",
    priceNote: "per business / month",
  },
];
