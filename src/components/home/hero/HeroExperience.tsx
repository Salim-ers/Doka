"use client";

import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { ArrowDown } from "lucide-react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { DokaButton } from "@/components/ui/DokaButton";
import { DokaLogo } from "@/components/brand/DokaLogo";
import { formatPrice, productsBySlug } from "@/data/products";
import type { TakeawayScene } from "./scene/takeaway-scene";
import { HANDOFF_AT, HANDOFF_HERO, RELEASE_AT } from "./scene/timing";
import videoMeta from "../../../../public/videos/hero-takeaway.json";

/**
 * Signature 1 — The Doka Moment / « Your coffee. On the go. »
 * Hero en section collante : la scène de la devanture joue sa boucle (un client arrive,
 * le barista lui tend un gobelet, il repart). Au passage du gobelet, « made for every day »
 * apparaît. Au scroll, la vue plonge vers le gobelet puis une nappe orange s'ouvre depuis
 * lui et révèle la section suivante.
 *
 * Trois rendus, choisis à l'exécution :
 * - « live »  : scène Three.js temps réel (grand écran, pointeur fin, WebGL) — la caméra suit
 *               la souris et zoome réellement sur le gobelet ;
 * - « video » : la même scène pré-rendue en vidéo (mobile, tactile, appareil modeste,
 *               pas de WebGL) — fluide et légère pour le processeur ;
 * - « poster » : une image de la scène (mouvement réduit, ou avant chargement).
 * Le poster est toujours affiché d'abord : c'est l'élément LCP, rien ne bloque le contenu.
 */

type Mode = "poster" | "loading" | "live" | "video";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function preferVideo() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 820;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 2;
  return coarse || small || weak || !hasWebGL();
}

/**
 * Point de passage du gobelet dans la vidéo : `local` dans le bloc média (origine du zoom),
 * `stage` dans la scène (position du slogan). Mesures de mise en page, hors transformations.
 */
function videoHandoff(media: HTMLElement) {
  const local = coverPoint(
    { width: media.offsetWidth, height: media.offsetHeight },
    videoMeta.width,
    videoMeta.height,
    videoMeta.handoff.x,
    videoMeta.handoff.y,
  );
  return { local, stage: { x: media.offsetLeft + local.x, y: media.offsetTop + local.y } };
}

/** Position (px, dans `box`) d'un point normalisé d'un média affiché en object-fit: cover. */
function coverPoint(box: { width: number; height: number }, mediaW: number, mediaH: number, nx: number, ny: number) {
  const scale = Math.max(box.width / mediaW, box.height / mediaH);
  const w = mediaW * scale;
  const h = mediaH * scale;
  return { x: (box.width - w) / 2 + nx * w, y: (box.height - h) / 2 + ny * h };
}

export function HeroExperience() {
  // Poster du hero préchargé selon le format (l'élément LCP de la page)
  preload("/images/doka/hero-scene.webp", { as: "image", media: "(min-width: 820px)", fetchPriority: "high" });
  preload("/images/doka/hero-scene-mobile.webp", { as: "image", media: "(max-width: 819px)", fetchPriority: "high" });

  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const zoomImgRef = useRef<HTMLImageElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TakeawayScene | null>(null);
  const modeRef = useRef<Mode>("poster");
  const cupScreen = useRef({ x: 0, y: 0 });
  const zoomLocked = useRef(false);
  const [mode, setModeState] = useState<Mode>("poster");
  const espresso = productsBySlug.espresso;

  const setMode = (m: Mode) => {
    modeRef.current = m;
    setModeState(m);
  };

  // --- Slogan « made for every day » au passage du gobelet
  const sloganTl = useRef<gsap.core.Timeline | null>(null);
  const sloganOn = useRef(false);
  function showSlogan(on: boolean) {
    const s = sloganRef.current;
    if (!s || sloganOn.current === on) return;
    sloganOn.current = on;
    const chars = s.querySelectorAll(".hero-slogan__char");
    sloganTl.current?.kill();
    sloganTl.current = on
      ? gsap
          .timeline()
          .set(s, { autoAlpha: 1 })
          .fromTo(
            chars,
            { yPercent: 110, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.022, ease: "doka.out" },
          )
      : gsap.timeline().to(chars, { yPercent: -110, autoAlpha: 0, duration: 0.4, stagger: 0.012, ease: "power2.in" });
  }

  /** Place le slogan (et l'origine de la nappe) sur le gobelet. */
  function placeSlogan(x: number, y: number, zoom: number) {
    cupScreen.current.x = x;
    cupScreen.current.y = y;
    const s = sloganRef.current;
    if (!s) return;
    s.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    s.style.setProperty("--z", zoom.toFixed(3));
  }

  // --- Chargement différé de la scène (3D temps réel ou vidéo)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introDone = window.setTimeout(() => document.documentElement.classList.add("intro-seen"), 1400);
    if (reduce) return () => window.clearTimeout(introDone);

    let cancelled = false;
    let scene: TakeawayScene | null = null;
    let io: IntersectionObserver | null = null;
    const video = preferVideo();

    const startLive = async () => {
      setMode("loading");
      const { createTakeawayScene } = await import("./scene/takeaway-scene");
      if (cancelled || !canvasRef.current) return;
      await document.fonts?.ready;
      if (cancelled || !canvasRef.current) return;
      try {
        scene = createTakeawayScene(canvasRef.current, {
          quality: "high",
          onHandoff: () => showSlogan(true),
          onRelease: () => showSlogan(false),
          onFrame: ({ cupX, cupY, zoom }) => placeSlogan(cupX, cupY, zoom),
        });
      } catch {
        setMode("video");
        return;
      }
      sceneRef.current = scene;
      io = new IntersectionObserver(([e]) => scene?.setActive(e.isIntersecting), { threshold: 0 });
      io.observe(canvasRef.current);
      setMode("live");
    };

    // Démarrage après le chargement de la page et un temps calme : la scène ne concurrence
    // jamais l'affichage du contenu (le poster tient la place jusque-là).
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    let handle = 0;
    const go = () => (video ? setMode("video") : void startLive());
    const schedule = () => {
      handle = window.setTimeout(
        () => {
          if (idle) idle(go, { timeout: 1200 });
          else go();
        },
        video ? 600 : 300,
      );
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    const onVis = () => scene?.setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      window.clearTimeout(introDone);
      window.clearTimeout(handle);
      window.removeEventListener("load", schedule);
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // --- Mode vidéo : lecture, slogan synchronisé sur le temps de la vidéo, pause hors écran
  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    const stage = stageRef.current;
    const media = mediaRef.current;
    if (!v || !stage || !media) return;
    let raf = 0;
    const place = () => {
      const p = videoHandoff(media).stage;
      placeSlogan(p.x, p.y, 0);
    };
    const loop = () => {
      const t = v.currentTime;
      if (!zoomLocked.current) showSlogan(t >= HANDOFF_AT && t < RELEASE_AT);
      raf = requestAnimationFrame(loop);
    };
    const onPlaying = () => {
      stage.setAttribute("data-playing", "");
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const onPause = () => cancelAnimationFrame(raf);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !zoomLocked.current) v.play().catch(() => {});
      else if (!e.isIntersecting) v.pause();
    });
    io.observe(v);
    place();
    window.addEventListener("resize", place);
    v.play().catch(() => {
      /* lecture automatique refusée : le poster reste affiché */
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      window.removeEventListener("resize", place);
    };
  }, [mode]);

  // --- Pointeur → légère orbite de caméra + parallaxe du logo de fond
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const bg = root.current?.querySelector<HTMLElement>(".hero__bglogo");
    const qx = bg ? gsap.quickTo(bg, "x", { duration: 1.2, ease: "power3.out" }) : null;
    const qy = bg ? gsap.quickTo(bg, "y", { duration: 1.2, ease: "power3.out" }) : null;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      sceneRef.current?.setPointer(nx, -ny);
      qx?.(nx * -18);
      qy?.(ny * -10);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // --- Entrée du hero + scroll (zoom, sortie du texte, nappe orange)
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const introPlaying = !document.documentElement.classList.contains("intro-seen");
        const delay = introPlaying ? 0.85 : 0.15;
        const reveal = el.querySelectorAll<HTMLElement>("[data-reveal='hero']");
        const split = SplitText.create(el.querySelector(".hero__title"), {
          type: "words,chars",
          mask: "words",
          wordsClass: "split-word",
          aria: "auto",
        });
        reveal.forEach((n) => n.removeAttribute("data-reveal"));
        gsap
          .timeline({ delay })
          // la scène ne passe jamais par l'opacité 0 : le poster reste l'élément LCP, peint au plus tôt
          .from(".hero__stage", { scale: 0.96, y: 30, duration: 1.3, ease: "doka.out" }, 0)
          .from(".hero__bglogo", { autoAlpha: 0, scale: 1.08, duration: 1.6, ease: "doka.out" }, 0)
          .from(".hero__kicker", { autoAlpha: 0, y: 14, duration: 0.6 }, 0.1)
          .from(split.chars, { yPercent: 115, duration: 0.9, stagger: 0.022, ease: "doka.out" }, 0.15)
          .from(".hero__lead", { autoAlpha: 0, y: 18, duration: 0.7 }, 0.55)
          .from(".hero__ctas > *", { autoAlpha: 0, y: 18, stagger: 0.08, duration: 0.6 }, 0.65)
          .from(".hero__sticker", { autoAlpha: 0, scale: 0, rotate: -40, duration: 0.8, ease: "doka.pop" }, 0.85)
          .from(".hero__scroll", { autoAlpha: 0, y: -10, duration: 0.6 }, 1);

        // Zoom « vidéo » : la vue avance vers le gobelet, puis se fond dans le gros plan
        const zoom = { v: 0 };
        const applyVideoZoom = () => {
          const media = mediaRef.current;
          const stage = stageRef.current;
          if (modeRef.current !== "video" || !media || !stage) return;
          const e = zoom.v;
          const { local, stage: p } = videoHandoff(media);
          const s = 1 + e * 1.8;
          // le gobelet glisse vers le centre de la scène pendant que la vue avance
          const tx = (stage.offsetWidth / 2 - p.x) * e;
          const ty = (stage.offsetHeight * 0.56 - p.y) * e;
          gsap.set(media, { x: tx, y: ty, scale: s, transformOrigin: `${local.x}px ${local.y}px` });
          gsap.set(zoomImgRef.current, { autoAlpha: gsap.utils.clamp(0, 1, (e - 0.5) / 0.25) });
          placeSlogan(p.x + tx, p.y + ty, e);
        };
        const setVideoScroll = (p: number) => {
          const v = videoRef.current;
          if (modeRef.current !== "video" || !v) return;
          if (p > 0.02 && !zoomLocked.current) {
            zoomLocked.current = true;
            v.pause();
            v.currentTime = HANDOFF_HERO;
            showSlogan(true);
          } else if (p <= 0.005 && zoomLocked.current) {
            zoomLocked.current = false;
            v.play().catch(() => {});
          }
        };

        const flood = floodRef.current;
        const st = gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.4,
              onUpdate: (self) => {
                sceneRef.current?.setScroll(self.progress);
                setVideoScroll(self.progress);
              },
            },
          })
          .to(".hero__copy", { yPercent: -18, autoAlpha: 0, ease: "none", duration: 0.32 }, 0)
          .to(".hero__scroll, .hero__sticker", { autoAlpha: 0, ease: "none", duration: 0.12 }, 0)
          .to(".hero__bglogo", { scale: 1.25, autoAlpha: 0, ease: "none", duration: 0.6 }, 0)
          .to(zoom, { v: 1, ease: "power2.inOut", duration: 0.75, onUpdate: applyVideoZoom }, 0.02)
          .fromTo(
            flood,
            { clipPath: "circle(0% at var(--cx) var(--cy))" },
            { clipPath: "circle(150% at var(--cx) var(--cy))", ease: "power2.in", duration: 0.22 },
            0.78,
          );
        // la nappe part du gobelet
        const syncFlood = () => {
          if (!flood) return;
          const { x, y } = cupScreen.current;
          const box = stageRef.current?.getBoundingClientRect();
          const cx = (box?.left ?? 0) + (x || window.innerWidth * 0.62 - (box?.left ?? 0));
          const cy = (box?.top ?? 0) + (y || window.innerHeight * 0.55 - (box?.top ?? 0));
          flood.style.setProperty("--cx", `${cx}px`);
          flood.style.setProperty("--cy", `${cy}px`);
        };
        gsap.ticker.add(syncFlood);
        return () => {
          gsap.ticker.remove(syncFlood);
          st.scrollTrigger?.kill();
          st.kill();
          split.revert();
          gsap.set([mediaRef.current, zoomImgRef.current], { clearProps: "all" });
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.querySelectorAll<HTMLElement>("[data-reveal='hero']").forEach((n) => n.removeAttribute("data-reveal"));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const slogan = "made for every day";

  return (
    <section ref={root} className="hero" aria-labelledby="hero-title">
      <div className="hero__sticky">
        <div className="hero__bglogo" aria-hidden="true">
          <DokaLogo title={null} />
        </div>

        <div ref={stageRef} className="hero__stage" data-mode={mode}>
          <div ref={mediaRef} className="hero__media">
            <picture className="hero__poster">
              <source media="(max-width: 819px)" srcSet="/images/doka/hero-scene-mobile.webp" type="image/webp" />
              <img
                src="/images/doka/hero-scene.webp"
                alt="Illustration 3D : au guichet rouge de Doka, le barista tend un gobelet doka à un passant."
                width={1600}
                height={900}
                fetchPriority="high"
                decoding="async"
                aria-hidden={mode === "live" || mode === "video" ? true : undefined}
              />
            </picture>
            {mode === "video" && (
              <>
                <video
                  ref={videoRef}
                  className="hero__video"
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster="/images/doka/hero-scene-mobile.webp"
                  aria-hidden="true"
                  tabIndex={-1}
                  disablePictureInPicture
                >
                  <source src="/videos/hero-takeaway.webm" type="video/webm" />
                  <source src="/videos/hero-takeaway.mp4" type="video/mp4" />
                </video>
              </>
            )}
          </div>
          {mode === "video" && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- gros plan pré-rendu, monté seulement en mode vidéo */}
              <img
                ref={zoomImgRef}
                className="hero__zoom"
                src="/images/doka/hero-zoom-mobile.webp"
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            </>
          )}
          <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
          <div ref={sloganRef} className="hero-slogan" aria-hidden="true">
            <span className="hero-slogan__inner brandline">
              {slogan.split("").map((c, i) => (
                <span key={i} className="hero-slogan__char">
                  {c === " " ? " " : c}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="hero__copy">
          <p className="hero__kicker brandline" data-reveal="hero">
            doka — made for every day
          </p>
          <h1 id="hero-title" className="hero__title display type-hero" data-reveal="hero">
            your coffee.
            <br />
            on the go.
          </h1>
          <p className="hero__lead lead" data-reveal="hero">
            Café de spécialité 100 % à emporter, servi au guichet du 15 rue Rambuteau. L&apos;espresso est à{" "}
            {formatPrice(espresso.price)}, tous les jours.
          </p>
          <div className="hero__ctas" data-reveal="hero">
            <DokaButton href="/la-carte" variant="orange" size="lg">
              Découvrir la carte
            </DokaButton>
            <DokaButton href="/nous-trouver" variant="outline" size="lg">
              Nous trouver
            </DokaButton>
          </div>
        </div>

        <p className="hero__sticker" data-reveal="hero">
          <span>100 %</span> à emporter
        </p>

        <a className="hero__scroll" href="#everyday" data-reveal="hero">
          <ArrowDown aria-hidden="true" size={16} strokeWidth={2.4} />
          Défiler
        </a>

        <div ref={floodRef} className="hero__flood t-orange" aria-hidden="true" />
      </div>
    </section>
  );
}
