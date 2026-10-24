import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@afterservice/ui";
import type { SeoFaqItem } from "../seo-faq";

export const landingFaqs: SeoFaqItem[] = [
  {
    question: "Does afterservice message my customers for me?",
    answer:
      "Your team initiates every contact. Log calls and messages from your usual channels, or send email when delivery is enabled for your workspace. Automatic outreach and connected SMS and WhatsApp delivery are planned.",
  },
  {
    question: "Can my staff use it on their phones?",
    answer:
      "Yes. The dashboard works on phones and desktops, so owners, office staff and technicians can add customers, log jobs and record replies.",
  },
  {
    question: "How does it fit with what we already use?",
    answer:
      "Today you log jobs directly in the dashboard. CSV import and job-source integrations are planned.",
  },
  {
    question: "How do review requests work?",
    answer:
      "afterservice is built around asking every customer for honest feedback. Issue recovery is a separate follow-up, so nobody is filtered out by how happy they seem.",
  },
  {
    question: "How do Free and Business compare?",
    answer:
      "Free includes the core board for one user. Business adds room for up to 3 users, 1,000 customers, 3,000 stored follow-ups and 25 templates for one monthly price. AI assistant and WhatsApp operations are coming soon.",
  },
];

export function LandingFAQ() {
  return (
    <section
      id="faqs"
      className="relative z-10 max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 border-t border-border"
    >
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground">
          Find answers to common questions about setting up and running
          afterservice.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
        <Accordion type="single" collapsible className="w-full">
          {landingFaqs.map((faq, idx) => (
            <AccordionItem
              key={faq.question}
              value={faq.question}
              className={idx === landingFaqs.length - 1 ? "border-b-0" : ""}
            >
              <AccordionTrigger className="text-left font-bold text-lg text-foreground hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
