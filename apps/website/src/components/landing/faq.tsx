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
      a: "afterservice integrates directly with your existing field management tools or CRMs via API and Zapier. You can also log jobs directly in our lightweight operator dashboard in under 10 seconds.",
    },
    {
      q: "Can my field staff use this on the go?",
      a: "Yes! The operator dashboard is fully optimized for mobile devices. Staff can easily complete a job, add customer details, and schedule follow-ups from their phones while still in the field.",
    },
    {
      q: "How does the private dispute resolution work?",
      a: "When a check-in message is sent, the customer is prompted to rate their experience. Ratings of 4 or 5 stars are instantly routed to your public Google, Yelp, or Facebook pages. Ratings under 4 stars open a private feedback channel, allowing you to resolve issues before they become public reviews.",
    },
    {
      q: "What channels are supported for follow-ups?",
      a: "Currently, we support email and SMS messaging. WhatsApp and automated phone outreach are currently in private beta and will be rolled out to Growth and Pro plans soon.",
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
            <AccordionItem key={idx} value={`item-${idx}`} className={idx === faqs.length - 1 ? "border-b-0" : ""}>
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
