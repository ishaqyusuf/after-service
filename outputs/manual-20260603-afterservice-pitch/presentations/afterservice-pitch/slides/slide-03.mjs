import { C, bg, card, foot, label, title } from "./shared.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "Start with small repair and installer shops that feel the pain monthly.", "Beachhead");
  card(slide, ctx, 70, 190, 520, 420, { fill: "#f8fbfa" });
  label(slide, ctx, "Ideal first customer", 100, 220, 300, 34, { size: 22, bold: true });
  [
    "1-10 staff",
    "Owner or office manager owns follow-up",
    "Completed jobs create warranty, callback, or repeat-service value",
    "Uses spreadsheets, Google Calendar, QuickBooks, WhatsApp, or basic booking tools",
    "Not deeply committed to Jobber, Housecall Pro, or ServiceTitan",
  ].forEach((item, i) => {
    const y = 282 + i * 54;
    ctx.addShape(slide, { x: 105, y: y + 2, w: 14, h: 14, fill: C.teal, line: ctx.line(C.teal, 0) });
    label(slide, ctx, item, 136, y - 2, 420, 40, { size: 15, color: C.ink });
  });
  const rows = [
    ["Best first", "HVAC, appliance repair, plumbing, garage doors, flooring, pest control"],
    ["Avoid first", "Salons, spas, clinics, multi-location reputation programs"],
    ["Reason", "Vertical tools already cover reminders, booking, reviews, or practice workflows"],
  ];
  rows.forEach(([a, b], i) => {
    const y = 216 + i * 112;
    card(slide, ctx, 650, y, 500, 86, { fill: i === 0 ? C.mint : C.white });
    label(slide, ctx, a, 680, y + 18, 130, 22, { size: 15, bold: true, color: i === 0 ? C.tealDark : C.ink });
    label(slide, ctx, b, 820, y + 17, 300, 48, { size: 14, color: C.muted });
  });
  foot(slide, ctx, "Source: Brain market grill memo, Best Wedge and Hard Grill sections");
  return slide;
}
