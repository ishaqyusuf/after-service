import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@afterservice/ui";
import type { SeoFaqItem } from "../seo-faq";

export const landingFaqs: SeoFaqItem[] = [
  {
    question: "How does afterservice integrate with my existing workflow?",
    answer:
      "With afterservice, you can log jobs directly in the operator dashboard. CSV import, Zapier/webhook intake, and job-source integrations are planned for paid plans once the core workflow is proven.",
  },
  {
    question: "Can my field staff use this on the go?",
    answer:
      "Yes. The dashboard is built to work on mobile and desktop so owners, office admins, and staff can add customers, log completed jobs, and schedule follow-ups.",
  },
  {
    question: "How do review requests work safely?",
    answer:
      "afterservice is designed around honest feedback for every customer. Public review requests should not be gated by sentiment; issue recovery is tracked as a separate follow-up workflow.",
  },
  {
    question: "What channels are supported for follow-ups?",
    answer:
      "The core workflow covers planning, templates and manual contact logging. The AI assistant and connected WhatsApp operations are coming soon. Customer-message delivery is separate when available.",
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
