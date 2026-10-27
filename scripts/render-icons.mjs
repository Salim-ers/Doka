// Icônes du site à partir du tracé officiel du logo (crème sur orange) : « do » au-dessus de « ka »,
// les lettres restent lisibles même à 16 px. À relancer si le logo change.
// Usage : node scripts/render-icons.mjs
//   src/app/icon.svg       favicon vectoriel (navigateurs récents)
//   src/app/favicon.ico    16, 32 et 48 px (anciens navigateurs, résultats Google)
//   src/app/apple-icon.png 180 px, fond plein (écran d'accueil iPhone, qui arrondit lui-même)
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(".");
const logoSrc = await readFile(path.join(root, "src/components/brand/logo-paths.ts"), "utf8");
const letter = Object.fromEntries([...logoSrc.matchAll(/\{ id: "(\w)", d: "([^"]+)"/g)].map((m) => [m[1], m[2]]));
const ORANGE = "#F14323";
const CREAM = "#FFFBEA";

// boîtes des deux lignes dans le repère du logo (1052.9 × 347.7)
const DO = { x: 0, w: 545.8, top: 0, bottom: 348.3 };
const KA = { x: 547.6, w: 505.3, top: 14.4, bottom: 341.8 };
const GAP = 22;
const W = Math.max(DO.w, KA.w);
const H = DO.bottom - DO.top + GAP + (KA.bottom - KA.top);

/** Carré `size` × `size`, coins `radius`, logo haut de `logoH` centré. */
function iconSvg({ size, radius, logoH }) {
  const s = logoH / H;
  const ox = (size - W * s) / 2;
  const oy = (size - logoH) / 2;
  const path = (d) => `<path fill="${CREAM}" fill-rule="evenodd" d="${d}"/>`;
  const doRow = `<g transform="translate(${((W - DO.w) / 2 - DO.x).toFixed(1)} ${-DO.top})">${path(letter.d)}${path(letter.o)}</g>`;
  const kaY = DO.bottom - DO.top + GAP - KA.top;
  const kaRow = `<g transform="translate(${((W - KA.w) / 2 - KA.x).toFixed(1)} ${kaY.toFixed(1)})">${path(letter.k)}${path(letter.a)}</g>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${ORANGE}"/>` +
    `<g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${s.toFixed(5)})">${doRow}${kaRow}</g></svg>`
  );
}

/** Rendu net : tracé à 8× puis réduit. */
const raster = (svg, size) =>
  sharp(Buffer.from(svg), { density: 72 * 8 })
    .resize(size, size)
    .png()
    .toBuffer();

/** Fichier .ico contenant des images PNG (format accepté partout depuis Windows Vista). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

await writeFile("src/app/icon.svg", iconSvg({ size: 64, radius: 14, logoH: 52 }));
console.log("✓ src/app/icon.svg");

// aux petites tailles, le logo prend presque toute la hauteur
const icoImages = [];
for (const size of [16, 32, 48]) {
  const svg = iconSvg({ size, radius: size * 0.2, logoH: size * (size === 16 ? 0.9 : 0.84) });
  icoImages.push({ size, png: await raster(svg, size) });
}
await writeFile("src/app/favicon.ico", ico(icoImages));
console.log("✓ src/app/favicon.ico");

await writeFile("src/app/apple-icon.png", await raster(iconSvg({ size: 180, radius: 0, logoH: 120 }), 180));
console.log("✓ src/app/apple-icon.png");
