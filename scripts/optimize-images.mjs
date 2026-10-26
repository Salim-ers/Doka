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
