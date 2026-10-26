import * as THREE from "three";

/**
 * Personnage minimaliste aux formes douces (capsules, sphères), matériaux mats.
 * Repère local : pieds en y = 0, le personnage regarde vers +Z.
 * Les bras pendent vers -Y ; rotation.x négative = bras levé vers l'avant.
 */
export type ArmRig = {
  shoulder: THREE.Group;
  elbow: THREE.Group;
  hand: THREE.Object3D;
  /** Pose « animée » (balancier, tenue) avant mélange IK. */
  pose: { shoulder: number; elbow: number; spread: number };
  ik: { target: THREE.Vector3; weight: number };
};

export type PersonRig = {
  root: THREE.Group;
  body: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  armL: ArmRig;
  armR: ArmRig;
  materials: THREE.MeshStandardMaterial[];
  shadow: THREE.Mesh;
  state: {
    walkPhase: number;
    walkAmount: number;
    holdR: number;
    lastX: number;
    lastZ: number;
    opacity: number;
    breath: number;
  };
};

type PersonStyle = {
  skin: string;
  top: string;
  bottom: string;
  shoes: string;
  hair: string;
  accent: string;
  height?: number;
  coat?: boolean;
  cap?: boolean;
  apron?: string;
  scarf?: boolean;
  segments: number;
};

const UPPER = 0.31;
const FORE = 0.33;

function mat(color: string, list: THREE.MeshStandardMaterial[], rough = 0.82) {
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: 0 });
  list.push(m);
  return m;
}

function capsule(r: number, len: number, m: THREE.Material, seg: number) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, Math.max(3, seg / 2), seg), m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(r: number, m: THREE.Material, seg: number) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.75)), m);
  mesh.castShadow = true;
  return mesh;
}

function makeArm(side: 1 | -1, sleeve: THREE.Material, skin: THREE.Material, seg: number): ArmRig {
  const shoulder = new THREE.Group();
  shoulder.position.set(0.27 * side, 1.5, 0);
  const upper = capsule(0.068, UPPER - 0.05, sleeve, seg);
  upper.position.y = -UPPER / 2;
  shoulder.add(upper);
  const elbow = new THREE.Group();
  elbow.position.y = -UPPER;
  shoulder.add(elbow);
  const fore = capsule(0.058, FORE - 0.08, sleeve, seg);
  fore.position.y = -FORE / 2 + 0.02;
  elbow.add(fore);
  const handMesh = sphere(0.062, skin, seg);
  handMesh.scale.set(0.9, 1.15, 0.85);
  handMesh.position.y = -FORE;
  elbow.add(handMesh);
  const hand = new THREE.Object3D();
  hand.position.y = -FORE - 0.02;
  elbow.add(hand);
  return {
    shoulder,
    elbow,
    hand,
    pose: { shoulder: 0, elbow: -0.12, spread: 0.06 },
    ik: { target: new THREE.Vector3(), weight: 0 },
  };
}

export function createPerson(style: PersonStyle, shadowTex: THREE.Texture): PersonRig {
  const materials: THREE.MeshStandardMaterial[] = [];
  const seg = style.segments;
  const skin = mat(style.skin, materials, 0.75);
  const top = mat(style.top, materials);
  const bottom = mat(style.bottom, materials);
  const shoes = mat(style.shoes, materials, 0.6);
  const hair = mat(style.hair, materials, 0.9);
  const accent = mat(style.accent, materials, 0.85);

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // Jambes (pivot à la hanche)
  const legs = ([1, -1] as const).map((side) => {
    const leg = new THREE.Group();
    leg.position.set(0.1 * side, 0.9, 0);
    const thigh = capsule(0.082, 0.72, bottom, seg);
    thigh.position.y = -0.43;
    leg.add(thigh);
    const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.12, 3, seg), shoes);
    shoe.rotation.x = Math.PI / 2;
    shoe.position.set(0, -0.86, 0.05);
    shoe.scale.set(1.05, 1, 0.75);
    shoe.castShadow = true;
    leg.add(shoe);
    body.add(leg);
    return leg;
  });

  // Buste
  const torso = capsule(0.21, style.coat ? 0.52 : 0.42, top, seg);
  torso.position.y = style.coat ? 1.24 : 1.29;
  torso.scale.set(1.08, 1, 0.78);
  body.add(torso);
  if (style.coat) {
    // Pan de manteau : léger évasement jusqu'aux genoux
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.42, seg, 1, true), top);
    skirt.position.y = 0.82;
    skirt.scale.set(1.05, 1, 0.8);
    skirt.castShadow = true;
    (skirt.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    body.add(skirt);
  }
  if (style.apron) {
    const apronMat = mat(style.apron, materials, 0.9);
    const apron = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.36, 3, seg), apronMat);
    apron.scale.set(1.1, 1, 0.42);
    apron.position.set(0, 1.18, 0.1);
    body.add(apron);
  }
  if (style.scarf) {
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 8, seg), accent);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.6;
    scarf.castShadow = true;
    body.add(scarf);
    const tail = capsule(0.045, 0.16, accent, seg);
    tail.position.set(0.07, 1.47, 0.12);
    tail.rotation.z = 0.15;
    body.add(tail);
  }

  // Tête
  const head = new THREE.Group();
  head.position.y = 1.62;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.12, seg), skin);
  neck.position.y = 0.04;
  head.add(neck);
  const skull = sphere(0.145, skin, seg);
  skull.position.y = 0.22;
  skull.scale.set(0.95, 1.05, 0.98);
  head.add(skull);
  const hairCap = sphere(0.152, hair, seg);
  hairCap.position.set(0, 0.25, -0.02);
  hairCap.scale.set(1, 0.92, 1);
  // ne garder que la calotte : on la remonte et on l'écrase
  hairCap.geometry = new THREE.SphereGeometry(0.152, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.55);
  head.add(hairCap);
  if (style.cap) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.158, seg, seg, 0, Math.PI * 2, 0, Math.PI * 0.45), accent);
    cap.position.y = 0.25;
    cap.castShadow = true;
    head.add(cap);
    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.02, seg, 1, false, -Math.PI / 2, Math.PI),
      accent,
    );
    visor.position.set(0, 0.3, 0.1);
    visor.scale.set(1, 1, 0.9);
    head.add(visor);
  }
  body.add(head);

  const armR = makeArm(-1, top, skin, seg);
  const armL = makeArm(1, top, skin, seg);
  body.add(armR.shoulder, armL.shoulder);

  const h = style.height ?? 1;
  root.scale.setScalar(h);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.9),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.006;
  shadow.renderOrder = 1;

  return {
    root,
    body,
    torso,
    head,
    legL: legs[1],
    legR: legs[0],
    armL,
    armR,
    materials,
    shadow,
    state: { walkPhase: 0, walkAmount: 0, holdR: 0, lastX: 0, lastZ: 0, opacity: 1, breath: Math.random() * 6 },
  };
}

const tmpV = new THREE.Vector3();
const tmpM = new THREE.Matrix4();

/**
 * IK analytique à deux segments dans le plan sagittal du bras (avant/bas).
 * Retourne les angles d'épaule et de coude qui amènent la main sur la cible.
 */
function solveArm(arm: ArmRig): { shoulder: number; elbow: number; spread: number } {
  const parent = arm.shoulder.parent;
  if (!parent) return arm.pose;
  parent.updateWorldMatrix(true, false);
  tmpM.copy(parent.matrixWorld).invert();
  tmpV.copy(arm.ik.target).applyMatrix4(tmpM).sub(arm.shoulder.position);
  // Plan du bras : z = avant, -y = bas. Écart latéral compensé par rotation.z.
  const fwd = tmpV.z;
  const down = -tmpV.y;
  const planar = Math.hypot(fwd, down);
  const dist = Math.min(Math.max(planar, 0.08), UPPER + FORE - 0.002);
  const a = UPPER;
  const b = FORE + 0.02;
  const cosElbow = (a * a + b * b - dist * dist) / (2 * a * b);
  const elbowInterior = Math.acos(THREE.MathUtils.clamp(cosElbow, -1, 1));
  const elbow = -(Math.PI - elbowInterior);
  const baseAngle = Math.atan2(fwd, down); // 0 = bras pendant, π/2 = horizontal avant
  const cosShoulder = (a * a + dist * dist - b * b) / (2 * a * dist);
  const shoulderOffset = Math.acos(THREE.MathUtils.clamp(cosShoulder, -1, 1));
  // Coude pointé vers le bas/arrière : le bras est moins avancé que la cible, l'avant-bras rattrape.
  const shoulder = -(baseAngle - shoulderOffset);
  return { shoulder, elbow, spread: arm.pose.spread };
}

/** Applique balancier de marche, respiration, IK et opacité. */
export function updatePerson(p: PersonRig, dt: number, time: number) {
  const s = p.state;
  const dx = p.root.position.x - s.lastX;
  const dz = p.root.position.z - s.lastZ;
  const moved = Math.hypot(dx, dz);
  s.lastX = p.root.position.x;
  s.lastZ = p.root.position.z;
  // La foulée suit la distance réellement parcourue : les pieds ne glissent pas.
  s.walkPhase += (moved / (0.62 * p.root.scale.x)) * Math.PI;
  const amt = s.walkAmount;
  const swing = Math.sin(s.walkPhase);
  p.legL.rotation.x = swing * 0.55 * amt;
  p.legR.rotation.x = -swing * 0.55 * amt;
  p.body.position.y = Math.abs(Math.cos(s.walkPhase)) * 0.035 * amt;
  p.body.rotation.y = swing * 0.06 * amt;

  // Respiration au repos
  s.breath += dt;
  const breathe = Math.sin(s.breath * 1.7) * (1 - amt);
  p.torso.scale.y = 1 + breathe * 0.012;
  p.head.rotation.x = Math.sin(s.breath * 0.9) * 0.03 * (1 - amt);
  p.head.rotation.z = Math.sin(s.breath * 0.6 + 1) * 0.02;

  // Bras gauche : balancier
  p.armL.pose.shoulder = swing * 0.42 * amt;
  p.armL.pose.elbow = -0.15 - Math.max(0, swing) * 0.25 * amt;
  // Bras droit : balancier ou tenue du gobelet
  const swingR = -swing * 0.42 * amt;
  p.armR.pose.shoulder = THREE.MathUtils.lerp(swingR, -0.42, s.holdR);
  p.armR.pose.elbow = THREE.MathUtils.lerp(-0.15 - Math.max(0, -swing) * 0.25 * amt, -1.3, s.holdR);

  for (const arm of [p.armL, p.armR]) {
    let sh = arm.pose.shoulder;
    let el = arm.pose.elbow;
    if (arm.ik.weight > 0.001) {
      const sol = solveArm(arm);
      sh = THREE.MathUtils.lerp(sh, sol.shoulder, arm.ik.weight);
      el = THREE.MathUtils.lerp(el, sol.elbow, arm.ik.weight);
    }
    arm.shoulder.rotation.x = sh;
    arm.elbow.rotation.x = el;
    arm.shoulder.rotation.z = arm.shoulder.position.x > 0 ? arm.pose.spread : -arm.pose.spread;
  }

  // Ombre de contact
  p.shadow.position.x = p.root.position.x;
  p.shadow.position.z = p.root.position.z;
  const sm = p.shadow.material as THREE.MeshBasicMaterial;
  sm.opacity = s.opacity;

  // Opacité (entrée / sortie de la maquette)
  for (const m of p.materials) {
    const transparent = s.opacity < 0.999;
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.needsUpdate = true;
    }
    m.opacity = s.opacity;
  }
  p.root.visible = s.opacity > 0.01;
  void time;
}
