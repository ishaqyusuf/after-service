export const C = {
  ink: "#13211b",
  muted: "#65736d",
  faint: "#eef5f1",
  line: "#d9e5df",
  teal: "#009b98",
  tealDark: "#047b78",
  mint: "#d9f4ec",
  green: "#58a66a",
  amber: "#d99a2b",
  red: "#c75a4a",
  white: "#ffffff",
  slate: "#26312c",
};

export function bg(slide, ctx, fill = C.white) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill });
}

export function title(slide, ctx, text, eyebrow) {
  if (eyebrow) {
    ctx.addText(slide, {
      text: eyebrow.toUpperCase(),
      x: 70,
      y: 42,
      w: 760,
      h: 22,
      size: 12,
      bold: true,
      color: C.tealDark,
      insets: { left: 0, right: 0, top: 0, bottom: 0 },
    });
  }
  ctx.addText(slide, {
    text,
    x: 70,
    y: eyebrow ? 70 : 50,
    w: 860,
    h: 96,
    size: 34,
    bold: true,
    color: C.ink,
    typeface: ctx.fonts.title,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function foot(slide, ctx, text = "afterservice.app") {
  ctx.addText(slide, {
    text,
    x: 70,
    y: 668,
    w: 500,
    h: 22,
    size: 11,
    color: C.muted,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    text: String(ctx.slideNumber).padStart(2, "0"),
    x: 1195,
    y: 668,
    w: 40,
    h: 22,
    size: 11,
    color: C.muted,
    align: "right",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function pill(slide, ctx, text, x, y, w, opts = {}) {
  ctx.addShape(slide, {
    x,
    y,
    w,
    h: opts.h ?? 34,
    fill: opts.fill ?? C.faint,
    line: ctx.line(opts.line ?? C.line, 1),
  });
  ctx.addText(slide, {
    text,
    x: x + 14,
    y: y + 8,
    w: w - 28,
    h: 18,
    size: opts.size ?? 12,
    bold: opts.bold ?? true,
    color: opts.color ?? C.ink,
    align: opts.align ?? "center",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function card(slide, ctx, x, y, w, h, opts = {}) {
  ctx.addShape(slide, {
    x,
    y,
    w,
    h,
    fill: opts.fill ?? C.white,
    line: ctx.line(opts.line ?? C.line, opts.lineWidth ?? 1),
  });
}

export function bigNumber(slide, ctx, number, label, x, y, w, color = C.teal) {
  ctx.addText(slide, {
    text: number,
    x,
    y,
    w,
    h: 58,
    size: 40,
    bold: true,
    color,
    typeface: ctx.fonts.title,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    text: label,
    x,
    y: y + 58,
    w,
    h: 44,
    size: 13,
    color: C.muted,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function label(slide, ctx, text, x, y, w, h = 42, opts = {}) {
  ctx.addText(slide, {
    text,
    x,
    y,
    w,
    h,
    size: opts.size ?? 15,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function arrow(slide, ctx, x1, y1, x2, y2, color = C.teal) {
  ctx.addShape(slide, {
    geometry: "line",
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: ctx.line(color, 2),
  });
  ctx.addShape(slide, {
    geometry: "triangle",
    x: x2 - 8,
    y: y2 - 6,
    w: 12,
    h: 12,
    fill: color,
    line: ctx.line(color, 0),
  });
}
