// Prépare les photographies Doka pour le web.
// - Les originaux restent intacts dans media/originals (non déployés).
// - Une copie maître WebP haute qualité (dimensions natives, aucun agrandissement)
//   est écrite dans public/images/doka : c'est la source utilisée par next/image,
//   qui sert ensuite AVIF/WebP aux bonnes tailles.
// - Une version AVIF statique est aussi générée (Open Graph, usages hors next/image).
// Retouches : aucune modification de contenu. Seule une légère accentuation (sharpen
// modéré) est appliquée pour compenser la compression. Pas d'upscale.
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("media/originals");
const OUT = path.resolve("public/images/doka");

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g)$/i.test(f));

for (const file of files) {
  const name = file.replace(/\.(png|jpe?g)$/i, "");
  const input = sharp(path.join(SRC, file)).rotate();
  const meta = await input.metadata();
  const base = input.clone().sharpen({ sigma: 0.6, m1: 0.4, m2: 0.8 });
  await base
    .clone()
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(OUT, `${name}.webp`));
  await base
    .clone()
    .avif({ quality: 62, effort: 6 })
    .toFile(path.join(OUT, `${name}.avif`));
  console.log(`${name}: ${meta.width}×${meta.height}`);
}

// Recadrages : versions sans le texte anglais incrusté dans certains visuels de campagne
// (le site est entièrement en français). L'original et sa version complète restent intacts.
const CROPS = [
  // gros plan sur le gobelet : sans le titre anglais « your favorite drink » (en tête)
  // ni le logo, coupé au bord bas dans le visuel d'origine
  { from: "doka-matcha-glace.png", to: "doka-matcha-glace-gros-plan", left: 300, top: 222, width: 1072, height: 452 },
];
for (const c of CROPS) {
  const input = sharp(path.join(SRC, c.from));
  const meta = await input.metadata();
  const base = input
    .clone()
    .extract({ left: c.left ?? 0, top: c.top, width: c.width ?? meta.width, height: c.height ?? meta.height - c.top })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 0.8 });
  await base
    .clone()
    .webp({ quality: 90, effort: 6 })
    .toFile(path.join(OUT, `${c.to}.webp`));
  await base
    .clone()
    .avif({ quality: 62, effort: 6 })
    .toFile(path.join(OUT, `${c.to}.avif`));
  console.log(`${c.to}: ${c.width ?? meta.width}×${c.height ?? meta.height - c.top}`);
}

// Photos d'illustration libres de droits (media/originals/stock, une par produit sans
// visuel Doka) : souvent très grandes, elles sont ramenées à 1672 px de large au plus
// (la plus grande taille servie par next/image) et écrites dans public/images/doka/produits.
const STOCK = path.join(SRC, "stock");
const STOCK_OUT = path.join(OUT, "produits");
await mkdir(STOCK_OUT, { recursive: true });
const stock = (await readdir(STOCK).catch(() => [])).filter((f) => /\.(png|jpe?g)$/i.test(f));
for (const file of stock) {
  const name = file.replace(/\.(png|jpe?g)$/i, "");
  const info = await sharp(path.join(STOCK, file))
    .rotate()
    .resize({ width: 1672, height: 1672, fit: "inside", withoutEnlargement: true })
    .sharpen({ sigma: 0.6, m1: 0.4, m2: 0.8 })
    .webp({ quality: 86, effort: 6 })
    .toFile(path.join(STOCK_OUT, `${name}.webp`));
  console.log(`produits/${name}: ${info.width}×${info.height}`);
}
