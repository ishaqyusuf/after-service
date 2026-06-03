import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide11(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, "#f7fbf9");
  title(slide, ctx, "Next ask: use free beta to find the paid beachhead.", "Operating Ask");
  card(slide, ctx, 90, 200, 360, 330, { fill: C.ink, line: ctx.line(C.ink, 0) });
  label(slide, ctx, "30 days", 124, 238, 260, 54, { size: 42, bold: true, color: C.white });
  label(slide, ctx, "to prove whether small service shops rely on afterservice enough to pay", 128, 320, 270, 84, { size: 20, bold: true, color: "#cfe0d9" });
  card(slide, ctx, 520, 200, 560, 330, { fill: C.white });
  label(slide, ctx, "Decision after beta", 552, 232, 320, 28, { size: 22, bold: true });
  [
    "If weekly usage and paid intent appear: launch Starter/Shop/Growth pricing.",
    "If setup friction dominates: prioritize import and integration work before public launch.",
    "If pain is generic or weak: narrow the ICP again or stop before building a bigger product.",
  ].forEach((item, i) => {
    ctx.addShape(slide, { x: 558, y: 300 + i * 68, w: 12, h: 12, fill: C.teal, line: ctx.line(C.teal, 0) });
    label(slide, ctx, item, 584, 292 + i * 68, 430, 44, { size: 15, color: C.ink });
  });
  label(slide, ctx, "afterservice.app", 90, 596, 360, 34, { size: 24, bold: true, color: C.tealDark });
  foot(slide, ctx, "Prepared from project Brain, June 2026");
  return slide;
}
