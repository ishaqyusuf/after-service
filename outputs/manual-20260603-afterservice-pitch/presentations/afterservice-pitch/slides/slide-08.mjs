import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "Roadmap: earn the workflow before automating the workflow.", "Product Roadmap");
  const lanes = [
    ["Now: manual MVP", "Customers\nCompleted jobs\nFollow-up board\nTemplates\nManual send logs", C.mint],
    ["Next: activation", "CSV import\nGoogle review link setup\nIssue workflow\nRecurring reminders\nSimple ROI dashboard", "#f8fbfa"],
    ["Then: paid scale", "Provider messaging\nZapier/webhooks\nAutomation rules\nTeam workflows\nReporting", "#f8fbfa"],
    ["Delay", "Full scheduling\nInvoicing\nPayments\nCustomer portal\nAI receptionist", "#fff5ee"],
  ];
  lanes.forEach(([head, body, fill], i) => {
    const x = 70 + i * 296;
    card(slide, ctx, x, 218, 250, 364, { fill, line: i === 3 ? "#f2c4a8" : C.line });
    label(slide, ctx, head, x + 20, 244, 205, 30, { size: 18, bold: true, color: i === 3 ? C.red : C.ink });
    label(slide, ctx, body, x + 20, 310, 205, 200, { size: 15, color: C.muted });
  });
  label(slide, ctx, "Manual workflows first, automation second. The product should never surprise the operator with customer messaging.", 88, 608, 1000, 48, { size: 18, bold: true });
  foot(slide, ctx, "Source: brain/product/vision.md; brain/product/roadmap.md");
  return slide;
}
