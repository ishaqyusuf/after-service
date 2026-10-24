import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "Pricing should reduce friction now and monetize scale later.", "Business Model");
  const plans = [
    ["Free Beta", "$0", "Validate real usage", "1 user\n100 customers\n200 follow-ups\n5 templates"],
    ["Starter", "$29/mo", "Solo owner/operator", "Core board\nCSV import\nBasic reports\nManual logging"],
    ["Shop", "$79/mo", "Small team", "5 users\nSequences\nProvider integrations\nRecurring reminders"],
    ["Growth", "$149/mo", "Scaling operator", "15 users\nAutomation rules\nZapier/webhooks\nPriority support"],
  ];
  plans.forEach(([name, price, buyer, features], i) => {
    const x = 72 + i * 292;
    card(slide, ctx, x, 210, 250, 356, { fill: i === 1 ? C.ink : i === 0 ? C.mint : "#f8fbfa", line: i === 1 ? C.ink : C.line });
    label(slide, ctx, name, x + 20, 238, 200, 26, { size: 19, bold: true, color: i === 1 ? C.white : C.ink });
    label(slide, ctx, price, x + 20, 284, 200, 52, { size: 34, bold: true, color: i === 1 ? "#98e6d5" : C.teal });
    label(slide, ctx, buyer, x + 20, 348, 190, 34, { size: 13, bold: true, color: i === 1 ? C.white : C.ink });
    label(slide, ctx, features, x + 20, 410, 190, 116, { size: 13, color: i === 1 ? "#cfe0d9" : C.muted });
  });
  label(slide, ctx, "Gating principle: keep the board open; charge for scale, teams, automation, integrations, reporting, and support.", 102, 600, 970, 46, { size: 18, bold: true, color: C.ink });
  foot(slide, ctx, "Source: brain/product/pricing-strategy.md");
  return slide;
}
