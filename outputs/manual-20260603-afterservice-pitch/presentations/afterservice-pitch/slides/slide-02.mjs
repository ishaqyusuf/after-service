import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "The job ends, but the customer relationship keeps leaking.", "Problem");
  const steps = [
    ["Work completed", "Customer is satisfied today, but no next touch is scheduled."],
    ["Follow-up forgotten", "Owners rely on memory, staff habits, calendars, spreadsheets, or WhatsApp."],
    ["Signal missed", "Warranty issues, review opportunities, referrals, and repeat-service prompts go cold."],
    ["Revenue and trust leak", "The business reacts late instead of owning the after-service moment."],
  ];
  steps.forEach(([head, body], i) => {
    const x = 84 + i * 292;
    const y = 250 + (i % 2) * 56;
    card(slide, ctx, x, y, 240, 150, { fill: i === 3 ? "#fff5ee" : "#f8fbfa", line: i === 3 ? "#f2c4a8" : C.line });
    label(slide, ctx, `0${i + 1}`, x + 18, y + 18, 48, 30, { size: 18, bold: true, color: i === 3 ? C.red : C.teal });
    label(slide, ctx, head, x + 18, y + 54, 200, 28, { size: 18, bold: true, color: C.ink });
    label(slide, ctx, body, x + 18, y + 88, 200, 42, { size: 11, color: C.muted });
    if (i < 3) ctx.addShape(slide, { geometry: "line", x: x + 248, y: y + 74, w: 44, h: 0, line: ctx.line(C.teal, 2) });
  });
  label(slide, ctx, "The wedge is not full field-service management. It is the specific operating gap after a completed job.", 100, 536, 980, 56, { size: 21, bold: true, color: C.ink });
  foot(slide, ctx, "Source: brain/product/vision.md; brain/research/2026-06-03-afterservice-market-grill.md");
  return slide;
}
