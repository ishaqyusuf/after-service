import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "The main risks are known, and the beta plan is designed to kill them quickly.", "Risks");
  const risks = [
    ["Nice-to-have risk", "Operators like the idea but do not use the board weekly.", "Weekly usage gate before charging."],
    ["Setup friction", "Manual entry slows adoption.", "CSV import first, then Zapier/webhook imports."],
    ["Incumbent pressure", "Jobber, HCP, Square, or Podium already solve enough.", "Focus on small shops and post-job promises, not full ops."],
    ["Compliance risk", "Review gating creates policy exposure.", "Ask every customer for honest feedback; issue workflow is separate."],
  ];
  risks.forEach(([risk, why, answer], i) => {
    const x = i % 2 === 0 ? 86 : 650;
    const y = i < 2 ? 198 : 418;
    card(slide, ctx, x, y, 490, 150, { fill: "#f8fbfa" });
    label(slide, ctx, risk, x + 24, y + 20, 420, 24, { size: 18, bold: true, color: C.ink });
    label(slide, ctx, why, x + 24, y + 58, 420, 36, { size: 13, color: C.muted });
    label(slide, ctx, answer, x + 24, y + 96, 420, 34, { size: 13, bold: true, color: C.tealDark });
  });
  foot(slide, ctx, "Source: Brain market grill memo, Compliance Risk and Fail Criteria");
  return slide;
}
