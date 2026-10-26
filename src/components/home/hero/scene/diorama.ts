import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { boardTexture, coffeeLabelTexture, gridTexture, signTexture } from "./textures";

/**
 * Maquette stylisée de la devanture Doka (15 rue Rambuteau), d'après la photo de façade :
 * cadre rouge, store en caisson, enseigne crème « doka made for everyday », guichet ouvert
 * sur un intérieur chaud, panneau bas quadrillé rouge, carte sur le montant droit.
 * Immeuble parisien simplifié autour. Aucun autre commerce identifiable n'est reproduit.
 */

export const PALETTE = {
  storefront: "#DE1F11",
  storefrontDark: "#B5150B",
  cream: "#FFFBEA",
  stone: "#EBDFC8",
  stoneShade: "#DCCDB1",
  sidewalk: "#D8CDBB",
  curb: "#C9BCA6",
  wood: "#8E431D",
  woodDark: "#6E3214",
  glass: "#3B4250",
  interior: "#F7DDB8",
  interiorRed: "#C9331F",
  iron: "#1E1D1A",
  leaf: "#5E7F37",
  flower: "#E2462B",
  ink: "#171714",
};

type Ctx = { quality: "high" | "low"; anisotropy: number };

function m(color: string, rough = 0.85, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: 0, ...extra });
}

/** Arrondis (RoundedBox) seulement en qualité haute ; boîtes simples sur mobile. */
let ROUNDED = true;

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, r = 0.02) {
  const geo = ROUNDED && r > 0 ? new RoundedBoxGeometry(w, h, d, 2, r) : new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export type Diorama = {
  group: THREE.Group;
  /** Position du gobelet en attente sur le comptoir arrière. */
  counterCup: THREE.Vector3;
  interiorLight: THREE.PointLight;
  dispose: () => void;
};

export function buildDiorama({ quality, anisotropy }: Ctx): Diorama {
  ROUNDED = quality === "high";
  const g = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  const stone = track(m(PALETTE.stone, 0.92));
  const stoneShade = track(m(PALETTE.stoneShade, 0.92));
  const red = track(m(PALETTE.storefront, 0.7));
  const redDark = track(m(PALETTE.storefrontDark, 0.75));
  const cream = track(m(PALETTE.cream, 0.8));
  const wood = track(m(PALETTE.wood, 0.7));
  const woodDark = track(m(PALETTE.woodDark, 0.75));
  const glass = track(m(PALETTE.glass, 0.35));
  const shopGlass = track(m("#5A4436", 0.4, { emissive: new THREE.Color("#3a2414"), emissiveIntensity: 0.4 }));
  const iron = track(m(PALETTE.iron, 0.6));
  const interior = track(m(PALETTE.interior, 0.9, { emissive: new THREE.Color("#FFB873"), emissiveIntensity: 0.32 }));
  const interiorRed = track(
    m(PALETTE.interiorRed, 0.8, { emissive: new THREE.Color("#7a1a0c"), emissiveIntensity: 0.25 }),
  );

  // --- Socle : trottoir parisien
  const slab = box(8.4, 0.5, 4.4, track(m(PALETTE.sidewalk, 0.95)), 0, -0.25, 1.6, 0.08);
  slab.castShadow = false;
  g.add(slab);
  const curb = box(8.4, 0.06, 0.28, track(m(PALETTE.curb, 0.95)), 0, 0.02, 3.62, 0.02);
  curb.castShadow = false;
  g.add(curb);
  // Joints de dalles
  const seamMat = track(m("#CBBFAA", 1));
  for (let x = -3.75; x <= 3.75; x += 1.5) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.004, 3.6), seamMat);
    seam.position.set(x, 0.002, 1.6);
    seam.receiveShadow = true;
    g.add(seam);
  }

  // --- Immeuble : mur de pierre en morceaux autour de la devanture (x ∈ [-1.9, 1.9], y ∈ [0, 3.7])
  const wallZ = -0.45;
  const wallD = 0.5;
  g.add(box(2.3, 5.6, wallD, stone, -3.05, 2.8, wallZ, 0.01));
  g.add(box(2.3, 5.6, wallD, stone, 3.05, 2.8, wallZ, 0.01));
  g.add(box(3.8, 1.9, wallD, stone, 0, 4.65, wallZ, 0.01));
  // Soubassement
  g.add(box(8.4, 0.22, 0.56, stoneShade, 0, 0.11, wallZ + 0.03, 0.02));
  // Corniche entre rez-de-chaussée et étage
  g.add(box(8.6, 0.16, 0.7, stoneShade, 0, 3.86, -0.3, 0.03));
  g.add(box(8.5, 0.08, 0.62, stone, 0, 3.98, -0.32, 0.02));
  // Couronnement
  g.add(box(8.6, 0.12, 0.68, stoneShade, 0, 5.62, -0.32, 0.03));

  // Fenêtres de l'étage, balcons en fer forgé, jardinières
  const winXs = quality === "high" ? [-3.05, 0, 3.05] : [-3.05, 3.05];
  for (const x of winXs) {
    g.add(box(1.12, 1.2, 0.06, cream, x, 4.75, -0.18, 0.02));
    g.add(box(0.94, 1.04, 0.05, glass, x, 4.77, -0.14, 0.01));
    g.add(box(0.04, 1.04, 0.07, cream, x, 4.77, -0.12, 0));
    // balcon
    g.add(box(1.3, 0.05, 0.42, iron, x, 4.1, 0.0, 0.01));
    g.add(box(1.3, 0.04, 0.03, iron, x, 4.5, 0.2, 0));
    for (let i = -0.6; i <= 0.61; i += 0.15) g.add(box(0.018, 0.4, 0.018, iron, x + i, 4.3, 0.2, 0));
    if (quality === "high") {
      g.add(box(0.9, 0.16, 0.18, track(m("#B4532E", 0.9)), x, 4.21, 0.05, 0.03));
      const leaf = track(m(PALETTE.leaf, 0.95));
      const flower = track(m(PALETTE.flower, 0.8));
      for (let i = 0; i < 6; i++) {
        const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12 + (i % 3) * 0.02, 1), i % 3 === 0 ? flower : leaf);
        s.position.set(x - 0.35 + i * 0.14, 4.34 + (i % 2) * 0.05, 0.05 + (i % 2) * 0.04);
        s.castShadow = true;
        g.add(s);
      }
    }
  }

  // --- Voisin de gauche : devanture en bois simplifiée, sans enseigne
  g.add(box(2.0, 3.2, 0.12, wood, -3.05, 1.82, -0.17, 0.02));
  g.add(box(1.05, 2.1, 0.06, shopGlass, -3.3, 1.6, -0.1, 0.01));
  g.add(box(0.5, 2.6, 0.06, woodDark, -2.45, 1.42, -0.1, 0.01));
  g.add(box(2.0, 0.42, 0.16, woodDark, -3.05, 3.1, -0.12, 0.02));

  // --- Voisin de droite : porte cochère en bois
  g.add(box(1.8, 3.25, 0.1, stoneShade, 3.05, 1.68, -0.18, 0.02));
  g.add(box(1.44, 2.95, 0.08, wood, 3.05, 1.6, -0.12, 0.02));
  for (const dx of [-0.36, 0.36]) {
    g.add(box(0.56, 1.1, 0.04, woodDark, 3.05 + dx, 2.3, -0.07, 0.02));
    g.add(box(0.56, 1.2, 0.04, woodDark, 3.05 + dx, 0.85, -0.07, 0.02));
  }
  g.add(box(0.02, 2.95, 0.1, woodDark, 3.05, 1.6, -0.07, 0));

  // --- Devanture Doka (cadre rouge en saillie)
  const SF = { x0: -1.9, x1: 1.9, top: 3.72, zBack: -0.22, zFront: 0.06 };
  const sfD = SF.zFront - SF.zBack;
  const sfZ = (SF.zFront + SF.zBack) / 2;
  const win = { x0: -0.98, x1: 0.98, y0: 1.04, y1: 2.38 };
  // montants
  g.add(box(win.x0 - SF.x0, SF.top, sfD, red, (SF.x0 + win.x0) / 2, SF.top / 2, sfZ, 0.015));
  g.add(box(SF.x1 - win.x1, SF.top, sfD, red, (SF.x1 + win.x1) / 2, SF.top / 2, sfZ, 0.015));
  // panneau bas quadrillé
  const grid = track(gridTexture(anisotropy));
  grid.repeat.set(6, 3);
  const gridMat = track(m("#ffffff", 0.85, { map: grid }));
  g.add(box(win.x1 - win.x0, win.y0, sfD - 0.04, gridMat, 0, win.y0 / 2, sfZ - 0.02, 0.01));
  // tablette du guichet
  g.add(box(win.x1 - win.x0 + 0.1, 0.06, 0.42, cream, 0, win.y0 + 0.03, SF.zFront + 0.02, 0.02));
  // enseigne crème
  const signTex = track(signTexture(anisotropy));
  const signMat = track(m("#ffffff", 0.8, { map: signTex }));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(win.x1 - win.x0, (win.x1 - win.x0) / 4), signMat);
  sign.position.set(0, win.y1 + 0.3, SF.zFront + 0.002);
  g.add(sign);
  const signFrameH = 3.1 - win.y1;
  g.add(box(win.x1 - win.x0, signFrameH, sfD, red, 0, win.y1 + signFrameH / 2, sfZ - 0.002, 0.01));
  sign.position.y = win.y1 + signFrameH / 2;
  sign.scale.setScalar(0.94);
  // bandeau haut
  g.add(box(win.x1 - win.x0, SF.top - 3.1, sfD, red, 0, (SF.top + 3.1) / 2, sfZ, 0.01));
  // store-caisson (légèrement incliné)
  const awning = box(4.0, 0.42, 1.0, red, 0, 3.55, 0.28, 0.04);
  awning.rotation.x = 0.1;
  g.add(awning);
  g.add(box(4.0, 0.06, 1.02, redDark, 0, 3.34, 0.3, 0.02));
  // carte sur le montant droit (rubriques sans prix)
  const boardTex = track(boardTexture(anisotropy));
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.84), track(m("#ffffff", 0.8, { map: boardTex })));
  board.position.set(1.44, 1.75, SF.zFront + 0.003);
  g.add(board);
  // petit cartel « coffee » sur le montant gauche (comme sur la vraie façade)
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.195),
    track(m("#ffffff", 0.8, { map: track(coffeeLabelTexture(anisotropy)) })),
  );
  label.position.set(-1.44, 2.1, SF.zFront + 0.003);
  g.add(label);

  // Potelets parisiens le long de la bordure
  const bollardMat = track(m("#3A3328", 0.55));
  for (const x of [-3.3, -1.7, 1.7, 3.3]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.78, 16), bollardMat);
    post.position.set(x, 0.39, 3.3);
    post.castShadow = true;
    g.add(post);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), bollardMat);
    knob.position.set(x, 0.8, 3.3);
    knob.castShadow = true;
    g.add(knob);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 20), bollardMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.66, 3.3);
    g.add(ring);
  }

  // --- Intérieur visible par le guichet
  const roomD = 1.5;
  const roomZ = SF.zBack - roomD / 2;
  const room = new THREE.Group();
  room.add(box(win.x1 - win.x0 + 0.4, 3.2, 0.06, interior, 0, 1.6, SF.zBack - roomD, 0));
  room.add(box(0.06, 3.2, roomD, interior, win.x0 - 0.2, 1.6, roomZ, 0));
  room.add(box(0.06, 3.2, roomD, interior, win.x1 + 0.2, 1.6, roomZ, 0));
  room.add(box(win.x1 - win.x0 + 0.4, 0.06, roomD, interior, 0, 3.0, roomZ, 0));
  room.add(box(win.x1 - win.x0 + 0.4, 0.06, roomD, track(m("#C9A27A", 0.9)), 0, 0, roomZ, 0));
  // comptoir intérieur sous le guichet
  room.add(box(win.x1 - win.x0, 1.0, 0.24, interiorRed, 0, 0.5, SF.zBack - 0.12, 0.02));
  // plan de travail arrière + machine
  const backZ = SF.zBack - roomD + 0.3;
  room.add(box(win.x1 - win.x0 + 0.3, 0.98, 0.5, interiorRed, 0, 0.49, backZ, 0.02));
  room.add(box(win.x1 - win.x0 + 0.3, 0.05, 0.54, cream, 0, 1.0, backZ, 0.01));
  const machine = track(m(PALETTE.ink, 0.45));
  room.add(box(0.62, 0.42, 0.36, machine, -0.36, 1.24, backZ - 0.02, 0.05));
  const chrome = track(m("#C8C3BA", 0.3, { metalness: 0.6 }));
  room.add(box(0.1, 0.07, 0.12, chrome, -0.48, 1.08, backZ + 0.18, 0.02));
  room.add(box(0.1, 0.07, 0.12, chrome, -0.24, 1.08, backZ + 0.18, 0.02));
  // étagère rouge + suspensions lumineuses
  room.add(box(0.9, 0.04, 0.22, interiorRed, 0.4, 2.15, SF.zBack - roomD + 0.14, 0.01));
  const lampMat = track(new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFE2B0") }));
  for (const x of [-0.45, 0.45]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), lampMat);
    lamp.position.set(x, 2.6, roomZ);
    room.add(lamp);
    room.add(box(0.01, 0.34, 0.01, machine, x, 2.82, roomZ, 0));
  }
  g.add(room);

  const interiorLight = new THREE.PointLight(new THREE.Color("#FFB86B"), 3.2, 4.5, 1.6);
  interiorLight.position.set(0, 2.3, SF.zBack - 0.8);
  g.add(interiorLight);

  return {
    group: g,
    counterCup: new THREE.Vector3(0.46, 1.025, backZ + 0.08),
    interiorLight,
    dispose() {
      g.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
      });
      disposables.forEach((d) => d.dispose());
    },
  };
}
