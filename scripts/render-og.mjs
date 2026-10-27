// Image de partage (Open Graph, 1200 × 630) en français : logo officiel crème sur orange,
// signature et adresse, avec les polices du site. À relancer si la signature ou l'adresse change.
// Usage : node scripts/render-og.mjs   (Chrome local : CHROME_PATH, sinon Chromium de Playwright)
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const root = path.resolve(".");
const logoSrc = await readFile(path.join(root, "src/components/brand/logo-paths.ts"), "utf8");
const viewBox = logoSrc.match(/width: ([\d.]+), height: ([\d.]+)/);
const paths = [...logoSrc.matchAll(/d: "([^"]+)"/g)].map((m) => m[1]);
// polices intégrées en data: URL (une page en mémoire ne peut pas charger de fichiers locaux)
const font = async (f) =>
  `data:font/woff2;base64,${(await readFile(path.join(root, "src/fonts", f))).toString("base64")}`;
const bricolage = await font("bricolage-grotesque-opsz.woff2");
const instrument = await font("instrument-sans-wght.woff2");

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Bricolage; src: url(${bricolage}) format("woff2"); font-weight: 200 800; }
@font-face { font-family: Instrument; src: url(${instrument}) format("woff2"); font-weight: 400 700; }
html, body { margin: 0; width: 1200px; height: 630px; }
body { display: grid; place-content: center; justify-items: center; gap: 26px; background: #f14323; color: #fffbea; text-align: center; }
svg { width: 620px; height: auto; display: block; }
.sign { margin: 6px 0 0; font: 800 66px/1 Bricolage; letter-spacing: -0.045em; font-variation-settings: "opsz" 96; }
.lines { margin: 0; color: #171714; font: 650 22px/1.5 Instrument; letter-spacing: 0.08em; text-transform: uppercase; }
</style></head><body>
<svg viewBox="0 0 ${viewBox[1]} ${viewBox[2]}">${paths.map((d) => `<path d="${d}" fill="#fffbea" fill-rule="evenodd"/>`).join("")}</svg>
<p class="sign">fait pour tous les jours</p>
<p class="lines">Café de spécialité 100 % à emporter<br>15 rue Rambuteau · 75004 Paris</p>
</body></html>`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot();
await browser.close();
await sharp(png).jpeg({ quality: 90, mozjpeg: true }).toFile("public/images/doka/doka-og.jpg");
console.log("✓ public/images/doka/doka-og.jpg");
