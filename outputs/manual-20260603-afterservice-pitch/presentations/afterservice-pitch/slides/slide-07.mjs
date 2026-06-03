import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "Free beta is a validation instrument, not the business model.", "Validation Plan");
  const weeks = [
    ["Week 1", "Interview 20 operators", "Map current follow-up workflow and pain language."],
    ["Week 2", "Run 10 concierge pilots", "Import last 30 completed jobs and set up next touches."],
    ["Week 3", "Ask for paid intent", "Test $49-$99/month and done-with-you setup."],
    ["Week 4", "Narrow the segment", "Keep only the beachhead with repeated urgency."],
  ];
  weeks.forEach(([week, head, body], i) => {
    const y = 182 + i * 108;
    card(slide, ctx, 98, y, 1050, 76, { fill: i === 2 ? C.mint : "#f8fbfa" });
    label(slide, ctx, week, 128, y + 22, 100, 28, { size: 18, bold: true, color: C.tealDark });
    label(slide, ctx, head, 270, y + 18, 320, 28, { size: 20, bold: true, color: C.ink });
    label(slide, ctx, body, 640, y + 18, 460, 42, { size: 15, color: C.muted });
  });
  card(slide, ctx, 250, 606, 780, 48, { fill: C.ink, line: ctx.line(C.ink, 0) });
  label(slide, ctx, "Charge when 3 businesses use it weekly or 3 businesses commit to paying.", 280, 620, 720, 22, { size: 17, bold: true, color: C.white });
  foot(slide, ctx, "Source: Brain market grill memo, 30-Day Validation Plan");
  return slide;
}

