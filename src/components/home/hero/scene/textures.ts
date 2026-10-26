import * as THREE from "three";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/brand/logo-paths";

const INK = "#171714";
const CREAM = "#FFFBEA";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas indisponible");
  return { c, ctx };
}

function finish(c: HTMLCanvasElement, anisotropy: number) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  t.needsUpdate = true;
  return t;
}

/** Dessine le logo officiel (tracé vectoriel fidèle) dans un contexte 2D. */
export function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, color: string) {
  const s = width / LOGO_VIEWBOX.width;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(LOGO_PATH), "evenodd");
  ctx.restore();
}

let SANS = '"Helvetica Neue", Arial, sans-serif';
/** Police des textures (la famille générée par next/font, lue sur le canvas). */
export function setCanvasFont(family: string) {
  if (family) SANS = family;
}

/** Enseigne crème : logo noir + « made for everyday », comme sur la vraie façade. */
export function signTexture(anisotropy: number) {
  const { c, ctx } = canvas(1024, 256);
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, c.width, c.height);
  const logoW = 470;
  drawLogo(ctx, 70, (256 - (LOGO_VIEWBOX.height * logoW) / LOGO_VIEWBOX.width) / 2 - 6, logoW, INK);
  ctx.fillStyle = INK;
  ctx.font = `500 46px ${SANS}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("made for everyday", 600, 190);
  return finish(c, anisotropy);
}

/** Habillage du gobelet : papier blanc cassé, logo noir horizontal (gobelet réel). */
export function cupTexture(anisotropy: number) {
  const { c, ctx } = canvas(1024, 512);
  ctx.fillStyle = "#FBF7EE";
  ctx.fillRect(0, 0, c.width, c.height);
  // Le lathe enroule u sur 360° : le logo occupe ~28 % de la circonférence, centré.
  const logoW = 300;
  const logoH = (LOGO_VIEWBOX.height * logoW) / LOGO_VIEWBOX.width;
  ctx.save();
  // Lathe : v=0 en bas. Le canvas est retourné verticalement par flipY, on dessine normalement.
  drawLogo(ctx, 512 - logoW / 2, 256 - logoH / 2 + 10, logoW, INK);
  ctx.restore();
  return finish(c, anisotropy);
}

/** Panneau bas de la devanture : quadrillage rouge tissé. */
export function gridTexture(anisotropy: number) {
  const { c, ctx } = canvas(128, 128);
  ctx.fillStyle = "#B8140C";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#E3261A";
  const step = 16;
  for (let y = 0; y < 128; y += step) {
    for (let x = 0; x < 128; x += step) {
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, step - 4, step - 4, 3);
      ctx.fill();
    }
  }
  const t = finish(c, anisotropy);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Panneau de carte sur le montant droit : titres de rubriques, sans prix (pas d'invention). */
export function boardTexture(anisotropy: number) {
  const { c, ctx } = canvas(256, 384);
  ctx.fillStyle = "#F0E9DA";
  ctx.fillRect(0, 0, 256, 384);
  ctx.fillStyle = INK;
  const sections: [string, number][] = [
    ["classics", 7],
    ["specials", 1],
    ["options", 3],
  ];
  let y = 46;
  for (const [title, rows] of sections) {
    ctx.font = `700 34px ${SANS}`;
    ctx.fillText(title, 22, y);
    y += 16;
    for (let i = 0; i < rows; i++) {
      ctx.fillRect(22, y + i * 15, 130 + ((i * 37) % 50), 4);
      ctx.fillRect(206, y + i * 15, 28, 4);
    }
    y += rows * 15 + 34;
  }
  drawLogo(ctx, 150, 340, 84, INK);
  return finish(c, anisotropy);
}

/** Ombre de contact douce (dégradé radial), posée sous les personnages et objets. */
export function blobShadowTexture() {
  const { c, ctx } = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(60,30,15,0.55)");
  g.addColorStop(0.55, "rgba(60,30,15,0.18)");
  g.addColorStop(1, "rgba(60,30,15,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Petit cartel « coffee » du montant gauche (présent sur la vraie devanture). */
export function coffeeLabelTexture(anisotropy: number) {
  const { c, ctx } = canvas(256, 96);
  ctx.fillStyle = "#F7F2E6";
  ctx.fillRect(0, 0, 256, 96);
  ctx.fillStyle = INK;
  ctx.font = `600 60px ${SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("coffee", 128, 50);
  return finish(c, anisotropy);
}
