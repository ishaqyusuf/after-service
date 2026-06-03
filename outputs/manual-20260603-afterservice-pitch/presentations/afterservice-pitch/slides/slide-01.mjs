import { C, bg, foot, label, pill } from "./shared.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx, "#f7fbf9");
  ctx.addShape(slide, { x: 720, y: 0, w: 560, h: 720, fill: C.ink, line: ctx.line(C.ink, 0) });
  ctx.addShape(slide, { x: 770, y: 70, w: 390, h: 500, fill: "#163027", line: ctx.line("#2c4a40", 1) });
  ["Completed job", "Check-in", "Review-safe request", "Issue recovery", "Repeat reminder"].forEach((item, i) => {
    const y = 112 + i * 76;
    ctx.addShape(slide, { x: 820, y, w: 260, h: 42, fill: i === 0 ? C.teal : "#203d34", line: ctx.line("#31584b", 1) });
    label(slide, ctx, item, 842, y + 10, 220, 18, { size: 12, bold: true, color: C.white });
    if (i < 4) ctx.addShape(slide, { geometry: "line", x: 950, y: y + 46, w: 0, h: 32, line: ctx.line(C.teal, 2) });
  });
  pill(slide, ctx, "FREE BETA NOW - PAID PLANS LATER", 70, 74, 320, { fill: C.mint, line: "#9adbc8", color: C.tealDark });
  ctx.addText(slide, {
    text: "afterservice",
    x: 70,
    y: 162,
    w: 590,
    h: 78,
    size: 48,
    bold: true,
    color: C.ink,
    typeface: ctx.fonts.title,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    text: "The post-job follow-up board for small service shops.",
    x: 70,
    y: 254,
    w: 590,
    h: 112,
    size: 30,
    bold: true,
    color: C.ink,
    typeface: ctx.fonts.title,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  label(slide, ctx, "Operators lose reviews, callbacks, referrals, and repeat work after the job is done. afterservice gives them one place to catch every next touch.", 74, 398, 520, 96, { size: 17, color: C.muted });
  label(slide, ctx, "Pitch deck - June 2026", 74, 585, 300, 24, { size: 13, color: C.muted });
  foot(slide, ctx);
  return slide;
}
