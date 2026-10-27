import * as THREE from "three";
import { gsap } from "gsap";
import { buildDiorama } from "./diorama";
import { createPerson, updatePerson } from "./rig";
import { blobShadowTexture, cupTexture, setCanvasFont } from "./textures";
import { LOOP, HANDOFF_AT, HANDOFF_HERO, RELEASE_AT } from "./timing";

/**
 * « Your coffee. On the go. » — scène 3D du hero.
 * Une boucle de 12 s : un client arrive au guichet, le barista attrape un gobelet,
 * le lui tend, le client repart avec. Au passage de main, `onHandoff` déclenche
 * le slogan « made for every day » côté DOM.
 */

export type SceneQuality = "high" | "low";

/** Point écran au-dessus de la tête d'un personnage ; `o` = opacité (le client s'efface en sortant). */
export type HeadPoint = { x: number; y: number; o: number };

export type FrameInfo = {
  /** Position écran (px, relatif au canvas) du gobelet. */
  cupX: number;
  cupY: number;
  /** Progression du zoom scroll (0 → 1). */
  zoom: number;
  /** Temps dans la boucle (s, 0 → LOOP) : synchronise le dialogue. */
  time: number;
  /** Au-dessus de la tête du client et du barista (px, relatif au canvas) : ancrage des bulles. */
  customer: HeadPoint;
  barista: HeadPoint;
};

export type SceneOptions = {
  quality: SceneQuality;
  onHandoff?: () => void;
  onRelease?: () => void;
  onFrame?: (info: FrameInfo) => void;
  /** Pose figée (poster / tests) : temps de la boucle à afficher. */
  freezeAt?: number;
  /**
   * Temps de la boucle au démarrage, caméra déjà en place : la scène reprend exactement
   * l'image du poster qu'elle remplace (aucun saut visible au fondu).
   */
  startAt?: number;
};

export type TakeawayScene = {
  /** Enregistrement vidéo : place la boucle au temps `t` et rend une image. */
  seek: (t: number, dt?: number) => void;
  /** Position normalisée (0–1) du gobelet dans le cadre courant. */
  project: () => { x: number; y: number };
  /** Positions normalisées (0–1) au-dessus des têtes (enregistrement vidéo du dialogue). */
  projectHeads: () => { customer: HeadPoint; barista: HeadPoint };
  setPointer: (nx: number, ny: number) => void;
  setScroll: (p: number) => void;
  setActive: (active: boolean) => void;
  dispose: () => void;
};

export { LOOP, HANDOFF_AT, HANDOFF_HERO, RELEASE_AT } from "./timing";

// Repères du monde (mètres)
const HANDOFF = new THREE.Vector3(-0.08, 1.22, -0.1);
const CUSTOMER_SPOT = new THREE.Vector3(-0.36, 0, 0.42);
const BARISTA_SPOT = new THREE.Vector3(0.19, 0, -0.72);
const BARISTA_BACK_Z = -0.98;
/** Du centre de la main au pied du gobelet : la main tient le gobelet à mi-hauteur. */
const HAND_TO_CUP = new THREE.Vector3(0, -0.16, 0);

function smooth(t: number) {
  const x = THREE.MathUtils.clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function createTakeawayScene(canvas: HTMLCanvasElement, opts: SceneOptions): TakeawayScene {
  const { quality } = opts;
  const high = quality === "high";
  setCanvasFont(getComputedStyle(canvas).fontFamily);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, high ? 1.75 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = high;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 0.5, 80);

  // --- Lumières : chaudes, douces, mates
  scene.add(new THREE.HemisphereLight(new THREE.Color("#FFF5E6"), new THREE.Color("#C9A383"), 1.35));
  const sun = new THREE.DirectionalLight(new THREE.Color("#FFF0D8"), 2.3);
  sun.position.set(5.5, 9, 7.5);
  sun.target.position.set(0, 1.2, 0.6);
  scene.add(sun, sun.target);
  if (high) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    const s = sun.shadow.camera;
    s.left = -6.5;
    s.right = 6.5;
    s.top = 6.5;
    s.bottom = -3;
    s.near = 1;
    s.far = 30;
    sun.shadow.radius = 5;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
  }
  const fill = new THREE.DirectionalLight(new THREE.Color("#FFD7C0"), 0.55);
  fill.position.set(-7, 3, 5);
  scene.add(fill);

  // --- Maquette
  const diorama = buildDiorama({ quality, anisotropy });
  scene.add(diorama.group);
  const shadowTex = blobShadowTexture();
  const floorShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(11.2, 6.2),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55 }),
  );
  floorShadow.rotation.x = -Math.PI / 2;
  floorShadow.position.set(0.2, -0.56, 1.7);
  scene.add(floorShadow);

  // --- Personnages
  const seg = high ? 20 : 12;
  const customer = createPerson(
    {
      skin: "#E2B796",
      top: "#1E1D1B",
      bottom: "#EFE6D2",
      shoes: "#171714",
      hair: "#3A2418",
      accent: "#F14323",
      coat: true,
      scarf: true,
      height: 1.03,
      segments: seg,
    },
    shadowTex,
  );
  const barista = createPerson(
    {
      skin: "#C99572",
      top: "#171714",
      bottom: "#2B2A27",
      shoes: "#171714",
      hair: "#20150F",
      accent: "#F14323",
      cap: true,
      apron: "#FFFBEA",
      height: 0.98,
      segments: seg,
    },
    shadowTex,
  );
  barista.shadow.visible = false;
  scene.add(customer.root, customer.shadow, barista.root);

  // --- Gobelet Doka (illustration, pas une photo du produit)
  const cup = new THREE.Group();
  const cupTex = cupTexture(anisotropy);
  const cupMat = new THREE.MeshStandardMaterial({ map: cupTex, roughness: 0.62 });
  const lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#F6F0E2"), roughness: 0.55 });
  // Paroi conique (UV standard : le logo est centré sur la hauteur) + fond
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.071, 0.052, 0.2, high ? 48 : 28, 1, true), cupMat);
  wall.position.y = 0.1;
  wall.castShadow = true;
  cup.add(wall);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.052, 24), lidMat);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = 0.001;
  cup.add(bottom);
  const lidRim = new THREE.Mesh(new THREE.CylinderGeometry(0.079, 0.079, 0.02, high ? 40 : 24), lidMat);
  lidRim.position.y = 0.212;
  const lidTop = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.075, 0.03, high ? 40 : 24), lidMat);
  lidTop.position.y = 0.236;
  lidRim.castShadow = lidTop.castShadow = true;
  cup.add(lidRim, lidTop);
  cup.scale.setScalar(1.55);
  scene.add(cup);
  const cupMats = [cupMat, lidMat];

  // --- État animé (piloté par la timeline GSAP)
  const anim = { cupStage: 0, bLean: 0, cLean: 0 };
  const counterCup = diorama.counterCup.clone();

  function resetPose() {
    customer.root.position.set(-4.9, 0, CUSTOMER_SPOT.z);
    customer.root.rotation.y = Math.PI / 2;
    customer.state.lastX = -4.9;
    customer.state.lastZ = CUSTOMER_SPOT.z;
    customer.state.walkAmount = 1;
    customer.state.holdR = 0;
    customer.armR.ik.weight = 0;
    barista.root.position.copy(BARISTA_SPOT);
    barista.root.rotation.y = 0;
    barista.state.holdR = 0;
    barista.armR.ik.weight = 0;
    anim.cupStage = 0;
    anim.bLean = 0;
    anim.cLean = 0;
  }
  resetPose();

  const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "sine.inOut" } });
  tl.call(resetPose, [], 0);
  // 1. Le client arrive dans la rue
  tl.fromTo(customer.root.position, { x: -4.9 }, { x: CUSTOMER_SPOT.x, duration: 3.0, ease: "power1.out" }, 0);
  tl.to(customer.state, { walkAmount: 0, duration: 0.55, ease: "power1.in" }, 2.6);
  tl.to(customer.root.rotation, { y: Math.PI, duration: 0.55 }, 2.85);
  // 2. Le barista se tourne vers la machine et saisit un gobelet
  tl.to(barista.root.rotation, { y: Math.PI, duration: 0.55 }, 1.7);
  tl.to(barista.root.position, { z: BARISTA_BACK_Z, duration: 0.55 }, 1.75);
  tl.call(() => barista.armR.ik.target.copy(counterCup).add(new THREE.Vector3(0, 0.16, 0)), [], 2.2);
  tl.to(barista.armR.ik, { weight: 1, duration: 0.4 }, 2.2);
  tl.to(anim, { cupStage: 1, duration: 0.28, ease: "power2.out" }, 2.62);
  tl.to(barista.armR.ik, { weight: 0, duration: 0.42 }, 2.86);
  tl.to(barista.state, { holdR: 1, duration: 0.42 }, 2.86);
  tl.to(barista.root.rotation, { y: Math.PI * 2, duration: 0.55 }, 3.05);
  tl.to(barista.root.position, { z: BARISTA_SPOT.z, duration: 0.55 }, 3.1);
  // 3. Il tend le café, le client avance la main
  tl.call(
    () => {
      barista.armR.ik.target.copy(HANDOFF);
      customer.armR.ik.target.copy(HANDOFF);
    },
    [],
    3.6,
  );
  tl.to(barista.armR.ik, { weight: 1, duration: 0.6 }, 3.62);
  tl.to(anim, { bLean: 0.13, duration: 0.6 }, 3.62);
  tl.to(customer.armR.ik, { weight: 1, duration: 0.62 }, 3.78);
  tl.to(anim, { cLean: 0.1, duration: 0.6 }, 3.78);
  // 4. Le gobelet passe d'une main à l'autre
  tl.call(() => opts.onHandoff?.(), [], HANDOFF_AT);
  tl.to(anim, { cupStage: 2, duration: 0.55, ease: "power1.inOut" }, HANDOFF_AT);
  tl.to(barista.armR.ik, { weight: 0, duration: 0.55 }, 5.0);
  tl.to(barista.state, { holdR: 0, duration: 0.5 }, 5.0);
  tl.to(anim, { bLean: 0, duration: 0.6 }, 5.0);
  tl.to(customer.armR.ik, { weight: 0, duration: 0.7 }, 5.05);
  tl.to(customer.state, { holdR: 1, duration: 0.7 }, 5.05);
  tl.to(anim, { cLean: 0, duration: 0.6 }, 5.05);
  // 5. Le client repart tranquillement, café en main
  tl.to(customer.root.rotation, { y: Math.PI / 2, duration: 0.55 }, 6.15);
  tl.to(customer.state, { walkAmount: 1, duration: 0.5, ease: "power1.out" }, 6.35);
  tl.to(customer.root.position, { x: 4.9, duration: 4.1, ease: "power1.in" }, 6.4);
  tl.call(() => opts.onRelease?.(), [], RELEASE_AT);
  tl.set({}, {}, LOOP);

  // --- Caméra
  const target = new THREE.Vector3();
  const baseTarget = new THREE.Vector3(0, 1.95, 0.6);
  const cupWorld = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const tmpC = new THREE.Vector3();
  const tmpT = new THREE.Vector3();
  const ZOOM_LIFT = new THREE.Vector3(0, 0.22, 0);
  const HEAD_TOP = new THREE.Vector3(0, 0.3, 0);
  const tmpHead = new THREE.Vector3();
  /** Point normalisé (0–1) au-dessus de la tête d'un personnage, dans le cadre courant. */
  function headPoint(p: typeof customer): HeadPoint {
    p.head.getWorldPosition(tmpHead).add(HEAD_TOP).project(camera);
    return { x: tmpHead.x * 0.5 + 0.5, y: -tmpHead.y * 0.5 + 0.5, o: p.state.opacity };
  }
  let width = 1;
  let height = 1;
  let baseDistance = 18;
  let filmShift = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let scroll = 0;
  let scrollSmooth = 0;
  let intro = 0;
  let zoomLocked = false;

  // Coins de la maquette, pour cadrer automatiquement selon le format du canvas
  const corners: THREE.Vector3[] = [];
  for (const x of [-4.2, 4.2])
    for (const y of [-0.5, 5.7]) for (const zz of [-0.7, 3.85]) corners.push(new THREE.Vector3(x, y, zz));
  const fitCam = new THREE.PerspectiveCamera();
  const BASE_AZ = 0.46;
  const BASE_EL = 0.27;

  function orbit(cam: THREE.PerspectiveCamera, t: THREE.Vector3, dist: number, az: number, el: number) {
    cam.position.set(
      t.x + dist * Math.sin(az) * Math.cos(el),
      t.y + dist * Math.sin(el),
      t.z + dist * Math.cos(az) * Math.cos(el),
    );
    cam.lookAt(t);
    cam.updateMatrixWorld(true);
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.filmOffset = 0;
    camera.updateProjectionMatrix();
    const wide = camera.aspect > 1.25;
    // Part de l'écran réservée à la maquette (en NDC) : à droite sur grand écran, pleine largeur sinon
    const half = wide ? 0.64 : 0.95;
    const halfY = wide ? 0.9 : 0.9;
    fitCam.copy(camera);
    let lo = 4;
    let hi = 60;
    const p = new THREE.Vector3();
    let cx = 0;
    for (let i = 0; i < 22; i++) {
      const d = (lo + hi) / 2;
      orbit(fitCam, baseTarget, d, BASE_AZ, BASE_EL);
      let minX = Infinity;
      let maxX = -Infinity;
      let maxY = 0;
      for (const c of corners) {
        p.copy(c).project(fitCam);
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, Math.abs(p.y));
      }
      cx = (minX + maxX) / 2;
      if ((maxX - minX) / 2 > half || maxY > halfY) lo = d;
      else hi = d;
    }
    baseDistance = hi;
    // Décalage optique : centre de la maquette placé à droite sur grand écran
    const desired = wide ? 0.33 : 0;
    const shiftNdc = desired - cx;
    filmShift =
      (-shiftNdc * camera.getFilmWidth() * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect) / 1;
    camera.updateProjectionMatrix();
  }

  function stagePos(stage: number, out: THREE.Vector3) {
    tmp.copy(counterCup);
    barista.root.updateMatrixWorld(true);
    customer.root.updateMatrixWorld(true);
    barista.armR.hand.getWorldPosition(tmpB).add(HAND_TO_CUP);
    customer.armR.hand.getWorldPosition(tmpC).add(HAND_TO_CUP);
    if (stage <= 1) out.lerpVectors(tmp, tmpB, stage);
    else out.lerpVectors(tmpB, tmpC, stage - 1);
    return out;
  }

  function updateCamera(dt: number) {
    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3);
    scrollSmooth += (scroll - scrollSmooth) * Math.min(1, dt * 6);
    const z = smooth(scrollSmooth / 0.85);
    intro = Math.min(1, intro + dt / 2.4);
    const introE = 1 - Math.pow(1 - intro, 3);
    const breathe = opts.freezeAt !== undefined ? 0 : Math.sin(performance.now() / 2600) * 0.12;

    const az = THREE.MathUtils.lerp(BASE_AZ, 0.78, z) + pointer.sx * 0.07 * (1 - z);
    const el = THREE.MathUtils.lerp(BASE_EL, 0.12, z) + pointer.sy * 0.035 * (1 - z);
    const dist = THREE.MathUtils.lerp(baseDistance * (1.1 - 0.1 * introE) + breathe, 3.5, z);
    target.lerpVectors(baseTarget, tmpT.copy(cupWorld).add(ZOOM_LIFT), z);
    camera.position.set(
      target.x + dist * Math.sin(az) * Math.cos(el),
      target.y + dist * Math.sin(el),
      target.z + dist * Math.cos(az) * Math.cos(el),
    );
    camera.lookAt(target);
    camera.filmOffset = filmShift * (1 - z);
    camera.updateProjectionMatrix();
    return z;
  }

  const timer = new THREE.Timer();
  let raf = 0;
  let active = false;
  let disposed = false;

  // Régulateur de fluidité : si l'appareil peine, on baisse la résolution, puis on
  // rend une image sur deux (l'animation garde sa vitesse, le rendu reste régulier).
  let avg = 1 / 60;
  let slow = 0;
  let halfRate = false;
  let tick = 0;
  let lowered = false;

  function frame() {
    if (disposed) return;
    timer.update();
    const rawDt = timer.getDelta();
    step(Math.min(rawDt, 0.05), rawDt);
    // Pose figée : pas de boucle, un rendu par changement de taille suffit
    if (active && opts.freezeAt === undefined) raf = requestAnimationFrame(frame);
  }

  /** Avance l'état d'un pas de temps `dt` et rend l'image. */
  function step(dt: number, rawDt = dt) {
    if (opts.freezeAt === undefined && rawDt > 0 && rawDt < 0.5) {
      avg += (rawDt - avg) * 0.05;
      slow = avg > 1 / 42 ? slow + 1 : Math.max(0, slow - 2);
      if (slow > 90 && !lowered) {
        lowered = true;
        slow = 0;
        renderer.setPixelRatio(1);
        layout();
      } else if (slow > 90 && lowered) {
        halfRate = true;
      }
    }
    const time = timer.getElapsed();
    void time;
    customer.body.rotation.x = anim.cLean;
    barista.body.rotation.x = anim.bLean;
    const absX = Math.abs(customer.root.position.x);
    customer.state.opacity = 1 - smooth((absX - 3.35) / 0.75);
    updatePerson(customer, dt, time);
    updatePerson(barista, dt, time);
    stagePos(anim.cupStage, cupWorld);
    cup.position.copy(cupWorld);
    const cupOpacity = anim.cupStage > 1.98 ? customer.state.opacity : 1;
    for (const m of cupMats) {
      const tr = cupOpacity < 0.999;
      if (m.transparent !== tr) {
        m.transparent = tr;
        m.needsUpdate = true;
      }
      m.opacity = cupOpacity;
    }
    cup.visible = cupOpacity > 0.01;
    // le logo du gobelet regarde la caméra
    cup.rotation.y = Math.atan2(camera.position.x - cup.position.x, camera.position.z - cup.position.z) + Math.PI;
    // centre du gobelet pour la caméra et le slogan
    tmp.copy(cupWorld).add(new THREE.Vector3(0, 0.16, 0));
    cupWorld.copy(tmp);
    const z = updateCamera(dt);
    tick++;
    if (!halfRate || tick % 2 === 0) renderer.render(scene, camera);
    if (opts.onFrame) {
      tmp.copy(cupWorld).project(camera);
      const c = headPoint(customer);
      const b = headPoint(barista);
      opts.onFrame({
        cupX: (tmp.x * 0.5 + 0.5) * width,
        cupY: (-tmp.y * 0.5 + 0.5) * height,
        zoom: z,
        time: tl.time(),
        customer: { x: c.x * width, y: c.y * height, o: c.o },
        barista: { x: b.x * width, y: b.y * height, o: b.o },
      });
    }
  }

  const ro = new ResizeObserver(() => {
    layout();
    if (!active || opts.freezeAt !== undefined) frame();
  });
  ro.observe(canvas);
  layout();

  if (opts.freezeAt !== undefined) {
    intro = 1;
    tl.time(opts.freezeAt).pause();
    // plusieurs passes pour stabiliser les positions dérivées
    for (let i = 0; i < 4; i++) frame();
  } else if (opts.startAt !== undefined) {
    intro = 1;
    tl.time(opts.startAt);
  }

  function setActive(next: boolean) {
    if (disposed || next === active) return;
    active = next;
    if (active) {
      timer.reset();
      if (opts.freezeAt === undefined && !zoomLocked) tl.play();
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      tl.pause();
    }
  }

  let seek: gsap.core.Tween | null = null;
  function setScroll(p: number) {
    scroll = p;
    if (opts.freezeAt !== undefined) return;
    // Au premier mouvement de scroll, on cale la boucle sur le passage du gobelet
    if (p > 0.02 && !zoomLocked) {
      zoomLocked = true;
      seek?.kill();
      tl.pause();
      seek = tl.tweenTo(HANDOFF_HERO, { duration: 0.9, ease: "power2.inOut" });
      opts.onHandoff?.();
    } else if (p <= 0.005 && zoomLocked) {
      zoomLocked = false;
      seek?.kill();
      seek = null;
      if (active) tl.play();
    }
  }

  return {
    seek(t: number, dt = 1 / 24) {
      intro = 1;
      tl.time(t, false);
      step(dt);
    },
    project() {
      tmp.copy(cupWorld).project(camera);
      return { x: tmp.x * 0.5 + 0.5, y: -tmp.y * 0.5 + 0.5 };
    },
    projectHeads() {
      return { customer: headPoint(customer), barista: headPoint(barista) };
    },
    setPointer(nx, ny) {
      pointer.x = THREE.MathUtils.clamp(nx, -1, 1);
      pointer.y = THREE.MathUtils.clamp(ny, -1, 1);
    },
    setScroll,
    setActive,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      seek?.kill();
      tl.kill();
      diorama.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      });
      cupTex.dispose();
      shadowTex.dispose();
      renderer.dispose();
    },
  };
}
