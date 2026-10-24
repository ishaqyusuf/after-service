import { C, bg, bigNumber, card, foot, label, title } from "./shared.mjs";

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  title(slide, ctx, "The upside is a focused point product in a large, fragmented SMB workflow.", "Market And Economics");
  card(slide, ctx, 84, 192, 360, 360, { fill: "#f8fbfa" });
  bigNumber(slide, ctx, "1M-3M", "Potential U.S. local service businesses that may care about post-service follow-up", 118, 230, 290);
  bigNumber(slide, ctx, "$29-$149", "Plausible monthly ARPA range for a focused micro-SaaS point solution", 118, 390, 290, C.green);
  card(slide, ctx, 500, 192, 690, 360, { fill: C.ink, line: ctx.line(C.ink, 0) });
  label(slide, ctx, "First 3-year SOM target", 540, 230, 360, 28, { size: 18, bold: true, color: "#98e6d5" });
  label(slide, ctx, "500-5,000 customers", 540, 282, 480, 50, { size: 38, bold: true, color: C.white });
  label(slide, ctx, "$300k-$6M ARR depending on ARPA and churn", 540, 354, 520, 34, { size: 20, bold: true, color: C.white });
  label(slide, ctx, "The point is not to out-platform incumbents. It is to own a narrow workflow they make too expensive, too buried, or too generic.", 540, 438, 560, 66, { size: 17, color: "#cfe0d9" });
  foot(slide, ctx, "Source: Brain market grill memo; public anchors include SBA, IMARC, Marketdata, Market Intelo");
  return slide;
}

