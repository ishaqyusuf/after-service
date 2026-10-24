#!/usr/bin/env bun

import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import {
  brandColors,
  brandMarkDot,
  brandMarkPaths,
} from "../packages/ui/src/brand.ts";

const require = createRequire(
  new URL("../apps/website/package.json", import.meta.url),
);
const sharp = require(
  require.resolve("sharp", { paths: [require.resolve("next/package.json")] }),
);
const root = new URL("../", import.meta.url);
const paths = brandMarkPaths
  .map(
    (d) =>
      `<path d="${d}" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
  )
  .join("");
const dot = `<circle cx="${brandMarkDot.cx}" cy="${brandMarkDot.cy}" r="${brandMarkDot.r}" fill="${brandColors.accent}"/>`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><style>:root{color:${brandColors.ink}}@media(prefers-color-scheme:dark){:root{color:${brandColors.paper}}}</style>${paths}${dot}</svg>\n`;
// A 75% mark keeps the complete silhouette inside the maskable safe circle.
const appIcon = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64" fill="none" color="${brandColors.ink}"><path fill="${brandColors.paper}" d="M0 0H64V64H0Z"/><g transform="translate(8 8) scale(.75)">${paths}${dot}</g></svg>`,
);

function encodeIco(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, index) => {
    const entry = 6 + index * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

const png = (size) => sharp(appIcon).resize(size, size).png().toBuffer();
const faviconRaster = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" color="${brandColors.ink}">${paths}${dot}</svg>`,
);
const ico = encodeIco(
  await Promise.all(
    [16, 32, 48].map(async (size) => ({
      size,
      png: await sharp(faviconRaster).resize(size, size).png().toBuffer(),
    })),
  ),
);

for (const app of ["website", "dashboard"]) {
  const appDir = new URL(`apps/${app}/src/app/`, root);
  await writeFile(new URL("icon.svg", appDir), favicon);
  await writeFile(new URL("favicon.ico", appDir), ico);
  await writeFile(new URL("apple-icon.png", appDir), await png(180));
}

const iconsDir = new URL("apps/website/public/icons/", root);
await mkdir(iconsDir, { recursive: true });
await writeFile(new URL("icon-192.png", iconsDir), await png(192));
await writeFile(new URL("icon-512.png", iconsDir), await png(512));
await writeFile(new URL("maskable-512.png", iconsDir), await png(512));
console.log(
  "Generated website/dashboard favicons, Apple touch icons, and PWA icons.",
);
