import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@afterservice/ui";

export function LandingFAQ() {
  const faqs = [
    {
      q: "How does afterservice integrate with my existing workflow?",
      a: "During beta, you can log jobs directly in the operator dashboard. CSV import, Zapier/webhook intake, and job-source integrations are planned for paid plans once the core workflow is proven.",
    },
    {
      q: "Can my field staff use this on the go?",
      a: "Yes. The dashboard is built to work on mobile and desktop so owners, office admins, and staff can add customers, log completed jobs, and schedule follow-ups.",
    },
    {
      q: "How do review requests work safely?",
      a: "afterservice is designed around honest feedback for every customer. Public review requests should not be gated by sentiment; issue recovery is tracked as a separate follow-up workflow.",
    },
    {
      q: "What channels are supported for follow-ups?",
      a: "The beta focuses on planning, templates, and manual send logging. Provider-powered email, SMS, WhatsApp, and automation rules are planned after beta for teams that need scale.",
    },
    {
      q: "When will paid plans launch?",
      a: "Paid plans launch after the beta proves weekly usage and paid intent. Beta users can use the core board for free and will keep founder-rate pricing when paid plans launch.",
    },
  ];

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
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={faq.q}
              value={faq.q}
              className={idx === faqs.length - 1 ? "border-b-0" : ""}
            >
              <AccordionTrigger className="text-left font-bold text-lg text-foreground hover:text-primary transition-colors">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
