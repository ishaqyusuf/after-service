import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "The market already spends, but the focused post-job workflow is underserved.", "Competitive Gap");
  const cols = [
    ["DIY tools", "Free, familiar", "Scattered and owner-dependent"],
    ["FSM platforms", "Complete operating system", "Too broad, expensive, or heavy for small shops"],
    ["Reputation tools", "Strong reviews and messaging", "Less tied to completed jobs and issue recovery"],
    ["afterservice", "Focused after-job board", "Must prove habit and integrations"],
  ];
  cols.forEach(([name, plus, minus], i) => {
    const x = 70 + i * 296;
    card(slide, ctx, x, 216, 250, 292, { fill: i === 3 ? C.ink : "#f8fbfa", line: i === 3 ? C.ink : C.line });
    label(slide, ctx, name, x + 20, 242, 210, 28, { size: 20, bold: true, color: i === 3 ? C.white : C.ink });
    label(slide, ctx, "Works because", x + 20, 306, 130, 20, { size: 11, bold: true, color: i === 3 ? "#98e6d5" : C.tealDark });
    label(slide, ctx, plus, x + 20, 334, 196, 48, { size: 14, color: i === 3 ? C.white : C.ink });
    label(slide, ctx, "Breaks because", x + 20, 410, 130, 20, { size: 11, bold: true, color: i === 3 ? "#f4c6b9" : C.red });
    label(slide, ctx, minus, x + 20, 430, 196, 42, { size: 13, color: i === 3 ? "#cfe0d9" : C.muted });
  });
  label(slide, ctx, "Positioning: a lightweight bolt-on for shops too small or too tired for full field-service software.", 92, 560, 1030, 34, { size: 22, bold: true, color: C.ink });
  foot(slide, ctx, "Competitor anchors: Jobber, Housecall Pro, Birdeye, Podium, NiceJob; see appendix");
  return slide;
}
