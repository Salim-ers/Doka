// Version vidéo de la scène du hero, pour mobile : rendue image par image depuis la
// vraie scène 3D (même code), puis encodée en WebM (VP9) et MP4 (H.264).
// Produit aussi l'image « zoom » (gobelet en gros plan) et les repères du dialogue
// (position des têtes au fil de la boucle).
// Prérequis : serveur de dev lancé (BASE_URL, défaut http://localhost:3000) et ffmpeg.
// Usage : node scripts/render-hero-video.mjs
import chromium from "@sparticuz/chromium";
import { chromium as pw } from "playwright-core";
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const FPS = 24;
const LOOP = 12;
const W = 720;
const H = 810; // même format que la zone 3D du hero mobile (≈ 0,89)
const OUT = "public/videos";

await mkdir(OUT, { recursive: true });
const frames = await mkdtemp(path.join(tmpdir(), "doka-frames-"));
const browser = await pw.launch({
  executablePath: process.env.CHROME_PATH ?? (await chromium.executablePath()),
  args: [...chromium.args, "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  headless: true,
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`${BASE}/lab/scene?t=0&q=low`, { waitUntil: "load" });
await page.waitForSelector("body[data-ready]", { state: "attached", timeout: 60000 });

// Chaque image attend la frame suivante du navigateur : le rendu (logiciel ici) ne prend pas de retard.
const seek = (t) =>
  page.evaluate(
    (time) =>
      new Promise((resolve) => {
        window.__doka.seek(time);
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    t,
  );
const total = FPS * LOOP;
// courte chauffe pour stabiliser les états intégrés (foulée, respiration)
for (let i = total - 24; i < total; i++) await seek(i / FPS);
// repères du dialogue : au-dessus des têtes, 8 fois par seconde (interpolés côté page)
const TRACK_EVERY = 3;
const r3 = (n) => Math.round(n * 1000) / 1000;
const talk = { fps: FPS / TRACK_EVERY, customer: [], barista: [] };
for (let i = 0; i < total; i++) {
  await seek(i / FPS);
  if (i % TRACK_EVERY === 0) {
    const h = await page.evaluate(() => window.__doka.projectHeads());
    talk.customer.push([r3(h.customer.x), r3(h.customer.y), r3(h.customer.o)]);
    talk.barista.push([r3(h.barista.x), r3(h.barista.y)]);
  }
  await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.png`), timeout: 120000 });
  if (i % 48 === 0) console.log(`image ${i}/${total}`);
}
// repère du gobelet à la pose « héros »
await seek(4.68);
const handoff = await page.evaluate(() => window.__doka.project());
// image de gros plan (fin du zoom au scroll), plus nette
await page.setViewportSize({ width: W, height: H });
const zoomPage = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.6 });
await zoomPage.goto(`${BASE}/lab/scene?t=4.68&s=1&q=low`, { waitUntil: "load" });
await zoomPage.waitForSelector("body[data-ready]", { state: "attached", timeout: 60000 });
for (let i = 0; i < 40; i++)
  await zoomPage.evaluate(
    () => new Promise((resolve) => (window.__doka.seek(4.68, 1 / 24), requestAnimationFrame(() => resolve()))),
  );
await sharp(await zoomPage.screenshot({ timeout: 120000 })).webp({ quality: 82 }).toFile("public/images/doka/hero-zoom-mobile.webp");
await browser.close();

const input = path.join(frames, "f%04d.png");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", input, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "38", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-an", path.join(OUT, "hero-takeaway.webm")]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", input, "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", path.join(OUT, "hero-takeaway.mp4")]);
await writeFile(
  path.join(OUT, "hero-takeaway.json"),
  JSON.stringify({ width: W, height: H, fps: FPS, loop: LOOP, handoff, talk }) + "\n",
);
await rm(frames, { recursive: true });
console.log("✓ public/videos/hero-takeaway.{webm,mp4,json}, public/images/doka/hero-zoom-mobile.webp", handoff);
