export type StageKey = "due" | "upcoming" | "waiting" | "replied" | "closed";

export const stageLabels: Record<StageKey, string> = {
  due: "Due today",
  upcoming: "Upcoming",
  waiting: "Waiting",
  replied: "Replied",
  closed: "Closed",
};

export const hero = {
  title: "Every finished job gets a check-in.",
  body: "afterservice keeps the customer, the completed work and a dated check-in together. Your team contacts customers the way they already do, records the reply, and opens the app to a clear list of who is due today.",
  micro: "Free plan · No credit card required · Phone and desktop",
};

export const reminderGaps = [
  "Memory",
  "A notebook by the till",
  "Phone calendar",
  "A spreadsheet",
  "Old WhatsApp threads",
];

export const storySteps = [
  {
    title: "Keep the context.",
    body: "Record the customer, the completed work and the small details. The next person to follow up starts informed.",
  },
  {
    title: "Plan the check-in.",
    body: "Give it a purpose and a due date. Start from a template, make it personal, then contact the customer your usual way.",
  },
  {
    title: "Keep the reply.",
    body: "Log the contact and what the customer said. Resolve an issue, close the follow-up or plan the next visit.",
  },
];

export const boardStages: Array<{
  key: StageKey;
  text: string;
  who: string;
  what: string;
}> = [
  {
    key: "due",
    text: "The date has arrived, or passed. Overdue items stay here until someone acts.",
    who: "Amara Okeke",
    what: "Check the AC repair is holding",
  },
  {
    key: "upcoming",
    text: "Planned for a later date.",
    who: "Ada Bello",
    what: "Laptop repair check-in, Tue 27 Oct",
  },
  {
    key: "waiting",
    text: "Contacted. Waiting for the customer to reply.",
    who: "Chinedu Eze",
    what: "Asked about the generator service",
  },
  {
    key: "replied",
    text: "The customer answered. Decide the next step.",
    who: "Grace Mensah",
    what: "“All good, thank you.”",
  },
  {
    key: "closed",
    text: "Done, with a closing note for next time.",
    who: "Daniel Okafor",
    what: "No further issue",
  },
];

export const boardRule =
  "Logging a contact moves a follow-up to Waiting. Logging the reply moves it to Replied. Closing it with a note moves it to Closed.";

export const audiences = [
  {
    name: "Repair shops",
    ask: "“Is everything still working as it should?”",
    text: "Check that the repair is holding up. Keep the original job and any new issue in the same history.",
    href: "/solutions/repair-shops",
  },
  {
    name: "Installers",
    ask: "“Any questions now that you’ve had time to use it?”",
    text: "Make room for questions after handover and record what the customer tells you.",
    href: "/solutions/installers",
  },
  {
    name: "Local contractors",
    ask: "“How has everything settled in since we finished?”",
    text: "Keep outstanding items visible and ask for honest feedback.",
    href: "/solutions/contractors",
  },
  {
    name: "Service teams",
    ask: "Check the last contact before following up.",
    text: "One place to find due follow-ups, notes and the last response.",
    href: "/solutions/field-service-teams",
  },
];

export const notFor =
  "Not built for dispatch, routing, estimating or inventory. afterservice covers the part after the job.";

export const availability = {
  title: "Manual today, on purpose.",
  body: "Your team starts every conversation. Contact customers through your usual channels and record the result, or send email when delivery is enabled for your workspace. A person stays in charge of every check-in.",
  today: [
    "Plan follow-ups",
    "Use templates",
    "Log contact and replies",
    "See what’s due",
  ],
  planned: [
    "Connected SMS and WhatsApp delivery",
    "Automation rules",
    "CSV import",
  ],
};

export const closing = {
  title: "Plan the first check-in this week.",
  body: "Record one finished job, give it a date, and see it on the board.",
  micro: "No credit card required",
};
