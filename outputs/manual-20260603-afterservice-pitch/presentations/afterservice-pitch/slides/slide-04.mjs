import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "afterservice turns every completed job into an owned next touch.", "Product System");
  const nodes = [
    ["Completed job", "Customer, date, service, value"],
    ["Follow-up board", "Due today, upcoming, replied, missed"],
    ["Template draft", "Review-safe, issue-safe, channel-aware"],
    ["Operator action", "Send, log, reschedule, assign"],
    ["Outcome loop", "Review, recovery, referral, repeat work"],
  ];
  nodes.forEach(([head, body], i) => {
    const x = 66 + i * 238;
    card(slide, ctx, x, 260, 198, 140, { fill: i === 1 ? C.ink : "#f8fbfa", line: i === 1 ? C.ink : C.line });
    label(slide, ctx, head, x + 18, 286, 160, 28, { size: 17, bold: true, color: i === 1 ? C.white : C.ink });
    label(slide, ctx, body, x + 18, 328, 160, 48, { size: 12, color: i === 1 ? "#bcd0c8" : C.muted });
    if (i < nodes.length - 1) ctx.addShape(slide, { geometry: "line", x: x + 208, y: 330, w: 28, h: 0, line: ctx.line(C.teal, 3) });
  });
  card(slide, ctx, 188, 488, 900, 72, { fill: C.mint, line: "#a6dfcf" });
  label(slide, ctx, "Core habit: every completed service job gets a next touch, and every follow-up has an owner, date, template, and status.", 218, 508, 840, 48, { size: 19, bold: true, color: C.tealDark });
  foot(slide, ctx, "Source: brain/product/vision.md; brain/features/follow-up-board-mvp.md");
  return slide;
}
