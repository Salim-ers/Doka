"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { setCurtainCovering } from "@/lib/entrance";
import { DokaLogoLetters } from "@/components/brand/DokaLogoLetters";
import { mainNav, legalNav } from "@/data/site-config";
import { productsBySlug } from "@/data/products";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export const usePageTransition = () => useContext(TransitionContext);

/** Durée minimale (ms) de couverture : le logo a fini de se poser avant de s'envoler. */
const MIN_COVER = 700;
const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_IN = "cubic-bezier(0.55, 0, 1, 0.45)";
/** Hauteur des bords arrondis de la nappe (dépassent en haut et en bas). */
const LIP = "18vh";
/**
 * Au-delà, la page n'arrive pas : navigation classique. En développement, chaque page est
 * compilée à sa première visite (plusieurs secondes) : on patiente bien plus longtemps.
 */
const FAILSAFE = process.env.NODE_ENV === "development" ? 30000 : 8000;

/** Nom de la page d'arrivée, affiché sous le logo pendant la transition. */
function labelFor(pathname: string) {
  const product = pathname.match(/^\/produits\/([^/]+)/)?.[1];
  if (product) return productsBySlug[product]?.name.toLowerCase() ?? "";
  const page = [...mainNav, ...legalNav].find((n) => n.href === pathname);
  return page ? page.label.toLowerCase() : "";
}

/**
 * Transition Doka, à chaque navigation interne :
 * 1. une nappe orange monte du bas de l'écran, bord supérieur arrondi ;
 * 2. les quatre lettres du logo se posent une à une, avec le nom de la page d'arrivée ;
 * 3. la page change sous la nappe, puis les lettres s'envolent et la nappe repart par le haut.
 * Tout est animé en `transform` / `opacity` avec l'API Web Animations : le compositeur du
 * navigateur fait tourner l'animation même pendant que la nouvelle page se construit
 * (aucune saccade sur un téléphone modeste). Le travail lourd (rendu, recalcul des
 * animations au scroll) se fait sous la nappe.
 * - La page n'est jamais révélée avant d'être prête ; si elle tarde trop, navigation classique.
 * - Clics pendant une transition : le dernier gagne ; précédent / suivant du navigateur : sans nappe.
 * - Mouvement réduit : navigation directe.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const pending = useRef<string | null>(null);
  const nextTarget = useRef("");
  const pushed = useRef(false);
  const busy = useRef(false);
  const startedAt = useRef(0);
  const failsafe = useRef(0);
  const waiting = useRef(0);
  const anims = useRef<Animation[]>([]);

  const play = (el: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    if (!el) return null;
    const a = el.animate(frames, { fill: "both", ...options });
    anims.current.push(a);
    return a;
  };
  const letters = () => Array.from(logo.current?.querySelectorAll("[data-letter]") ?? []);

  const finish = useCallback(() => {
    const el = curtain.current;
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    if (el) el.style.visibility = "hidden";
    busy.current = false;
    setCurtainCovering(false);
  }, []);

  const reveal = useCallback(() => {
    window.clearTimeout(failsafe.current);
    window.clearTimeout(waiting.current);
    label.current?.classList.remove("is-waiting");
    letters().forEach((l, i) =>
      play(
        l,
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: "translateY(-60%)", opacity: 0 },
        ],
        {
          duration: 260,
          delay: i * 30,
          easing: EASE_IN,
        },
      ),
    );
    play(label.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE_IN });
    const out = play(
      panel.current,
      [{ transform: "translateY(0)" }, { transform: `translateY(calc(-100% - ${LIP}))` }],
      { duration: 600, delay: 90, easing: EASE_IN_OUT },
    );
    out?.finished.then(finish, () => {});
  }, [finish]);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const target = url.pathname + url.search + url.hash;
      if (url.pathname === window.location.pathname) {
        if (url.hash) {
          document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", target);
        } else if (url.search !== window.location.search) {
          router.push(target);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      // Clic pendant une transition : le dernier clic gagne, la nappe attend sa page
      if (busy.current) {
        nextTarget.current = target;
        pending.current = url.pathname;
        if (label.current) label.current.textContent = labelFor(url.pathname);
        if (pushed.current) router.push(target);
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = curtain.current;
      if (reduce || !el || typeof el.animate !== "function") {
        router.push(target);
        return;
      }
      busy.current = true;
      pushed.current = false;
      startedAt.current = performance.now();
      setCurtainCovering(true);
      nextTarget.current = target;
      pending.current = url.pathname;
      router.prefetch(target);
      if (label.current) label.current.textContent = labelFor(url.pathname);

      anims.current.forEach((a) => a.cancel());
      anims.current = [];
      el.style.visibility = "visible";
      const cover = play(
        panel.current,
        [{ transform: `translateY(calc(100% + ${LIP}))` }, { transform: "translateY(0)" }],
        { duration: 520, easing: EASE_IN_OUT },
      );
      letters().forEach((l, i) =>
        play(l, [{ transform: "translateY(115%)" }, { transform: "translateY(0)" }], {
          duration: 440,
          delay: 160 + i * 40,
          easing: EASE_POP,
        }),
      );
      play(
        label.current,
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 300,
          delay: 320,
          easing: EASE_OUT,
        },
      );
      cover?.finished.then(
        () => {
          pushed.current = true;
          router.push(nextTarget.current);
          // la page tarde : le nom de la page respire doucement en attendant
          waiting.current = window.setTimeout(() => label.current?.classList.add("is-waiting"), 900);
          // filet de sécurité : si la page n'arrive pas, navigation classique
          failsafe.current = window.setTimeout(() => window.location.assign(nextTarget.current), FAILSAFE);
        },
        () => {},
      );
    },
    [router],
  );

  // La nouvelle page est rendue : sous la nappe, on remet le défilement en place et on recalcule
  // les animations au scroll (le coûteux), puis on lève la nappe dès que le logo est posé.
  useEffect(() => {
    if (!pending.current || pending.current !== pathname) return;
    pending.current = null;
    window.clearTimeout(failsafe.current);
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const anchor = hash ? document.getElementById(hash) : null;
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
    let raf = 0;
    const id = window.setTimeout(
      () => {
        ScrollTrigger.refresh();
        raf = requestAnimationFrame(reveal);
      },
      Math.max(60, MIN_COVER - (performance.now() - startedAt.current)),
    );
    return () => {
      window.clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [pathname, reveal]);

  // Focus sur le contenu après navigation (lecteurs d'écran, clavier)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById("contenu");
    main?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={curtain} className="page-curtain" aria-hidden="true">
        <div ref={panel} className="page-curtain__panel" />
        <div className="page-curtain__inner">
          <div ref={logo} className="page-curtain__logo">
            <DokaLogoLetters />
          </div>
          <p ref={label} className="page-curtain__label" />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
