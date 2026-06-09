export type SolutionPage = {
  audience: string;
  description: string;
  hero: string;
  outcomes: string[];
  pain: string;
  path: string;
  slug: string;
  title: string;
  workflows: string[];
};

export type GuidePage = {
  description: string;
  intro: string;
  path: string;
  sections: Array<{
    body: string;
    title: string;
  }>;
  slug: string;
  title: string;
};

export type FeaturePage = {
  description: string;
  highlights: string[];
  path: string;
  slug: string;
  title: string;
};

export const solutionPages: SolutionPage[] = [
  {
    audience: "Repair shops",
    description:
      "Post-repair follow-up software for repair shops that need customer check-ins, issue recovery, review requests, and repeat-service reminders in one board.",
    hero: "Keep every repair customer visible after the job leaves the shop.",
    outcomes: [
      "Catch unresolved issues before they become bad reviews.",
      "Ask for honest feedback after the customer has had time to use the repair.",
      "Keep repeat-service opportunities from disappearing into memory.",
    ],
    pain: "Completed repairs often move from the counter to memory, sticky notes, WhatsApp threads, or a spreadsheet. That makes it easy to miss the exact moment when a customer needs a check-in.",
    path: "/solutions/repair-shops",
    slug: "repair-shops",
    title: "Post-repair follow-up software for repair shops | afterservice",
    workflows: [
      "Log the completed repair and customer contact details.",
      "Create a due follow-up for a check-in, review request, or issue-resolution call.",
      "Use saved templates so staff know what to say without sounding robotic.",
      "Move follow-ups through a simple board until the customer outcome is resolved.",
    ],
  },
  {
    audience: "Installers",
    description:
      "Customer follow-up software for installers who need structured post-install check-ins, review-safe requests, issue recovery, and referral prompts.",
    hero: "Turn completed installs into reliable customer check-ins and review-safe requests.",
    outcomes: [
      "Follow up after the customer has lived with the installation.",
      "Separate issue recovery from review requests.",
      "Create a simple rhythm for referrals, maintenance, and repeat work.",
    ],
    pain: "Installers often finish great work on-site, then lose the follow-up to staff memory or an overloaded calendar. afterservice keeps the post-install workflow visible.",
    path: "/solutions/installers",
    slug: "installers",
    title: "Post-install customer follow-up software | afterservice",
    workflows: [
      "Record the completed installation and service category.",
      "Schedule a check-in based on the follow-up timing your team already uses.",
      "Track whether the customer replied, needs help, or is ready for a review request.",
      "Keep every post-install action tied to the original customer and job.",
    ],
  },
  {
    audience: "Contractors",
    description:
      "Post-job follow-up software for small contractors that need customer check-ins, review requests, issue recovery, and repeat-service reminders.",
    hero: "Give every completed contractor job a clear next follow-up.",
    outcomes: [
      "Stop depending on notebooks and memory after work is complete.",
      "Give office staff and owners one board for due customer check-ins.",
      "Build a repeatable habit before adding automation.",
    ],
    pain: "Small contractors win trust in the field, but post-job follow-up is usually scattered across texts, notes, calendars, and whoever remembers. afterservice gives the team a shared place to manage it.",
    path: "/solutions/contractors",
    slug: "contractors",
    title: "Post-job follow-up software for contractors | afterservice",
    workflows: [
      "Add customers and completed jobs as work wraps up.",
      "Create follow-ups for issue recovery, review requests, referrals, or repeat service.",
      "Use templates to keep communication consistent across staff.",
      "Review open and overdue follow-ups before they go cold.",
    ],
  },
  {
    audience: "Field service teams",
    description:
      "After-service follow-up software for small field service teams that need one board for completed jobs, customer check-ins, and manual outreach.",
    hero: "One follow-up board for small field teams after the service visit is done.",
    outcomes: [
      "Make post-visit ownership clear for owners, office staff, and technicians.",
      "Track follow-ups by status instead of chasing scattered reminders.",
      "Learn the manual workflow before deciding what should be automated.",
    ],
    pain: "For small field teams, the handoff after a completed visit is where customer trust can leak. afterservice keeps each check-in tied to the customer, job, and next action.",
    path: "/solutions/field-service-teams",
    slug: "field-service-teams",
    title: "After-service follow-up software for field teams | afterservice",
    workflows: [
      "Capture the completed service visit and follow-up owner.",
      "Schedule customer check-ins around your team's real service rhythm.",
      "Use the board to see what is open, scheduled, sent, replied, or closed.",
      "Keep message logs and notes available for future customer context.",
    ],
  },
];

export const guidePages: GuidePage[] = [
  {
    description:
      "A practical post-job follow-up checklist for service businesses that want customer check-ins, issue recovery, review requests, and repeat work to happen consistently.",
    intro:
      "The best post-job follow-up system is simple enough for a busy operator to use every week. Start manual, make ownership clear, and only automate after the workflow is proven.",
    path: "/guides/post-job-follow-up",
    sections: [
      {
        title: "1. Start from the completed job",
        body: "Every follow-up should point back to a real customer and a real job. Record what was completed, when it happened, who owns the follow-up, and what outcome you want next.",
      },
      {
        title: "2. Pick one next action",
        body: "Do not mix issue recovery, review requests, referrals, and repeat-service reminders into one vague reminder. Choose the follow-up type so the team knows what success looks like.",
      },
      {
        title: "3. Review open follow-ups weekly",
        body: "A board works because it makes open work visible. Check due and overdue items before they disappear into old messages or staff memory.",
      },
    ],
    slug: "post-job-follow-up",
    title: "Post-job follow-up checklist for service businesses | afterservice",
  },
  {
    description:
      "A review-safe workflow for service businesses that want to ask every customer for honest feedback without ignoring unresolved issues.",
    intro:
      "Good review workflows separate customer care from reputation work. First check whether the customer needs help, then ask for honest feedback when the timing is right.",
    path: "/guides/review-request-workflow",
    sections: [
      {
        title: "1. Check for unresolved issues first",
        body: "A follow-up should give customers an easy way to raise a concern. If something is wrong, route the work to issue recovery before asking for a public review.",
      },
      {
        title: "2. Ask every customer honestly",
        body: "Avoid gating language. A healthy process invites honest feedback from customers and gives the team a way to respond when the experience was not perfect.",
      },
      {
        title: "3. Keep the request tied to the job",
        body: "The best review request references the completed work, the customer relationship, and the channel your team can actually follow up on.",
      },
    ],
    slug: "review-request-workflow",
    title: "Review request workflow for service businesses | afterservice",
  },
  {
    description:
      "A simple issue-recovery follow-up workflow for service operators who need to catch customer problems after the job is complete.",
    intro:
      "Issue recovery is where good operators protect trust. The goal is not to hide problems. The goal is to find them early enough to fix them.",
    path: "/guides/issue-recovery-follow-up",
    sections: [
      {
        title: "1. Make the check-in specific",
        body: "Ask about the completed service, repair, or installation directly. Specific check-ins get better replies than generic customer satisfaction messages.",
      },
      {
        title: "2. Give the team one place to work replies",
        body: "A reply should not live only in one person's phone. Record the outcome, status, and next action so another staff member can understand the customer history.",
      },
      {
        title: "3. Close the loop",
        body: "A recovered issue should end with a recorded resolution. That creates better future context and shows which service categories create the most follow-up work.",
      },
    ],
    slug: "issue-recovery-follow-up",
    title:
      "Issue recovery follow-up after completed service work | afterservice",
  },
];

export const featurePages: FeaturePage[] = [
  {
    description:
      "A manual-first follow-up board for open, scheduled, sent, replied, missed, and closed customer follow-ups after service work is complete.",
    highlights: [
      "See which customer check-ins are open, due, overdue, or resolved.",
      "Keep follow-ups tied to customer records and completed service jobs.",
      "Give owners and staff one shared place to work post-job tasks.",
    ],
    path: "/features/follow-up-board",
    slug: "follow-up-board",
    title: "Follow-up board for completed service jobs | afterservice",
  },
  {
    description:
      "Saved follow-up templates for local service teams that want consistent customer check-ins without fully automating outbound messaging.",
    highlights: [
      "Create reusable message drafts for check-ins, review requests, and issue recovery.",
      "Keep staff aligned on tone without surprising customers.",
      "Start manual and learn which messages deserve automation later.",
    ],
    path: "/features/templates",
    slug: "templates",
    title: "Follow-up templates for service businesses | afterservice",
  },
  {
    description:
      "Customer history for service operators who need completed jobs, follow-up notes, templates, and outreach logs in one workspace.",
    highlights: [
      "Keep customers, jobs, follow-ups, and notes connected.",
      "Understand what happened before the next customer conversation.",
      "Preserve manual outreach logs for future context.",
    ],
    path: "/features/customer-history",
    slug: "customer-history",
    title: "Customer follow-up history for service teams | afterservice",
  },
];

export function getSolutionPage(slug: string) {
  return solutionPages.find((page) => page.slug === slug);
}

export function getGuidePage(slug: string) {
  return guidePages.find((page) => page.slug === slug);
}

export function getFeaturePage(slug: string) {
  return featurePages.find((page) => page.slug === slug);
}
