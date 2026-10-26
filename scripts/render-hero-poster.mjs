// Rend les posters du hero à partir de la vraie scène 3D (même code, pose figée
// au passage du gobelet). À relancer après toute modification de la scène.
// Prérequis : `npm run dev` (ou `npm start`) sur http://localhost:3000, ou BASE_URL.
// Usage : node scripts/render-hero-poster.mjs
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
import sharp from "sharp";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const T = 4.68; // HANDOFF_HERO dans takeaway-scene.ts
const targets = [
  { name: "hero-scene", width: 1600, height: 900, q: "high" },
  { name: "hero-scene-mobile", width: 800, height: 900, q: "low" },
];

const browser = await pw.launch({
  executablePath: process.env.CHROME_PATH ?? (await chromium.executablePath()),
  args: [...chromium.args, "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  headless: true,
});
// Chromium « single-process » : une seule page, réutilisée pour chaque format
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
for (const t of targets) {
  await page.setViewportSize({ width: t.width, height: t.height });
  await page.goto(`${BASE}/lab/scene?t=${T}&q=${t.q}&transparent=1`, { waitUntil: "load" });
  await page.waitForSelector("body[data-ready]", { state: "attached", timeout: 60000 });
  const buf = await page.screenshot({ omitBackground: true });
  await sharp(buf).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(`public/images/doka/${t.name}.webp`);
  console.log(`✓ public/images/doka/${t.name}.webp`);
}
await browser.close();
