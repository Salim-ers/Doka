"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { setCurtainCovering } from "@/lib/entrance";
import { DokaLogoLetters } from "@/components/brand/DokaLogoLetters";
import { mainNav, legalNav } from "@/data/site-config";
import { productsBySlug } from "@/data/products";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export const usePageTransition = () => useContext(TransitionContext);

/** Montée de la nappe (ms). Elle bouge dès le clic : aucune impression d'attente. */
const COVER = 360;
/** Durée minimale (ms) de couverture : le logo a fini de se poser avant de s'envoler. */
const MIN_COVER = 440;
/** Départ de la nappe (ms). */
const UNCOVER = 460;
const EASE_COVER = "cubic-bezier(0.3, 0, 0.15, 1)";
const EASE_UNCOVER = "cubic-bezier(0.55, 0, 0.15, 1)";
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
 * 1. une nappe orange monte du bas de l'écran, bord supérieur arrondi, pendant que le contenu
 *    de la page quittée s'efface en fondu ;
 * 2. les quatre lettres du logo se posent une à une, avec le nom de la page d'arrivée ;
 * 3. la nouvelle page se construit dès le clic, pendant la montée ; une fois l'écran couvert,
 *    les lettres s'envolent et la nappe repart par le haut.
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
  const safety = useRef(0);
  const grace = useRef(0);
  const arriveTimer = useRef(0);
  const revealing = useRef(false);
  const fromPath = useRef("");
  const anims = useRef<Animation[]>([]);
  const coverAnim = useRef<Animation | null>(null);

  const play = (el: Element | null, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    if (!el) return null;
    const a = el.animate(frames, { fill: "both", ...options });
    anims.current.push(a);
    return a;
  };
  const letters = () => Array.from(logo.current?.querySelectorAll("[data-letter]") ?? []);

  const finish = useCallback(() => {
    const el = curtain.current;
    window.clearTimeout(failsafe.current);
    window.clearTimeout(waiting.current);
    window.clearTimeout(safety.current);
    window.clearTimeout(grace.current);
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    coverAnim.current = null;
    document.documentElement.removeAttribute("data-leaving");
    label.current?.classList.remove("is-waiting");
    if (el) el.style.visibility = "hidden";
    busy.current = false;
    pushed.current = false;
    pending.current = null;
    setCurtainCovering(false);
  }, []);

  const reveal = useCallback(() => {
    if (revealing.current) return;
    revealing.current = true;
    window.clearTimeout(failsafe.current);
    window.clearTimeout(waiting.current);
    window.clearTimeout(grace.current);
    // filet : quoi qu'il arrive à l'animation, la nappe disparaît
    safety.current = window.setTimeout(finish, 1400);
    // la nappe couvre tout l'écran : le contenu, effacé au départ, revient dessous
    document.documentElement.removeAttribute("data-leaving");
    label.current?.classList.remove("is-waiting");
    letters().forEach((l, i) =>
      play(
        l,
        [
          { transform: "translateY(0)", opacity: 1 },
          { transform: "translateY(-60%)", opacity: 0 },
        ],
        {
          duration: 200,
          delay: i * 22,
          easing: EASE_IN,
        },
      ),
    );
    play(label.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: EASE_IN });
    const out = play(
      panel.current,
      [{ transform: "translateY(0)" }, { transform: `translateY(calc(-100% - ${LIP}))` }],
      { duration: UNCOVER, easing: EASE_UNCOVER },
    );
    if (out) out.finished.then(finish, finish);
    else finish();
  }, [finish]);

  /**
   * Arrivée sur la nouvelle page (souvent pendant que la nappe monte encore) : dès que la nappe
   * couvre tout l'écran et que le logo est posé, défilement, recalcul, puis levée de la nappe.
   */
  const arrive = useCallback(() => {
    window.clearTimeout(failsafe.current);
    window.clearTimeout(grace.current);
    const settle = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const anchor = hash ? document.getElementById(hash) : null;
      if (anchor) anchor.scrollIntoView();
      else window.scrollTo(0, 0);
      ScrollTrigger.refresh();
      requestAnimationFrame(reveal);
    };
    window.clearTimeout(arriveTimer.current);
    arriveTimer.current = window.setTimeout(
      () => {
        const cover = coverAnim.current;
        if (cover && cover.playState === "running") cover.finished.then(settle, settle);
        else settle();
      },
      Math.max(0, MIN_COVER - (performance.now() - startedAt.current)),
    );
  }, [reveal]);

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
      revealing.current = false;
      startedAt.current = performance.now();
      fromPath.current = window.location.pathname;
      setCurtainCovering(true, startedAt.current + MIN_COVER);
      nextTarget.current = target;
      pending.current = url.pathname;
      router.prefetch(target);
      if (label.current) label.current.textContent = labelFor(url.pathname);

      /**
       * Lance la navigation une seule fois, dès que la nappe a commencé à monter : la nouvelle
       * page se construit pendant la montée (et non après), son contenu reste effacé jusqu'à
       * ce que la nappe couvre tout l'écran.
       */
      const go = () => {
        // (pas de navigation si elle a été abandonnée entre-temps, ex. bouton précédent)
        if (pushed.current || !busy.current || !pending.current) return;
        pushed.current = true;
        router.push(nextTarget.current);
        // la page tarde : le nom de la page respire doucement en attendant
        waiting.current = window.setTimeout(() => label.current?.classList.add("is-waiting"), 900);
        // filet de sécurité : si la page n'arrive pas du tout, navigation classique
        failsafe.current = window.setTimeout(() => window.location.assign(nextTarget.current), FAILSAFE);
      };

      try {
        anims.current.forEach((a) => a.cancel());
        anims.current = [];
        el.style.visibility = "visible";
        // le contenu de la page quittée s'efface pendant que la nappe monte (layout.css)
        document.documentElement.setAttribute("data-leaving", "");
        coverAnim.current = play(
          panel.current,
          [{ transform: `translateY(calc(100% + ${LIP}))` }, { transform: "translateY(0)" }],
          { duration: COVER, easing: EASE_COVER },
        );
        letters().forEach((l, i) =>
          play(l, [{ transform: "translateY(115%)" }, { transform: "translateY(0)" }], {
            duration: 300,
            delay: 60 + i * 26,
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
            duration: 220,
            delay: 170,
            easing: EASE_OUT,
          },
        );
        // deux images plus tard : les animations de la nappe tournent déjà sur le compositeur,
        // le rendu de la nouvelle page ne peut plus les retarder (filet si l'onglet est en arrière-plan)
        requestAnimationFrame(() => requestAnimationFrame(go));
        window.setTimeout(go, 120);
      } catch {
        // animation impossible sur ce navigateur : navigation directe, rien ne reste bloqué
        finish();
        router.push(target);
      }
    },
    [router, finish],
  );

  // Nouvelle page insérée pendant que le contenu s'efface encore (appareil rapide) : invisible
  // d'un coup, avant même d'être affichée, pour ne jamais apparaître au-dessus de la nappe
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (busy.current && root.hasAttribute("data-leaving")) root.setAttribute("data-leaving", "arrived");
  }, [pathname]);

  // La nouvelle page est rendue : sous la nappe, on remet le défilement en place et on recalcule
  // les animations au scroll (le coûteux), puis on lève la nappe dès que le logo est posé.
  // Si l'adresse change vers une autre page que prévu (redirection, bouton précédent pendant la
  // transition…), on lève quand même la nappe : jamais de page bloquée sous l'orange.
  useEffect(() => {
    if (!busy.current || !pending.current) return;
    if (pathname === pending.current) {
      pending.current = null;
      arrive();
    } else if (pushed.current && pathname !== fromPath.current) {
      window.clearTimeout(grace.current);
      grace.current = window.setTimeout(() => {
        if (busy.current && pending.current) {
          pending.current = null;
          arrive();
        }
      }, 600);
    }
  }, [pathname, arrive]);

  // Précédent / suivant pendant une transition : on abandonne la page demandée et on lève la
  // nappe sur la page où le navigateur revient (aucune navigation forcée ensuite)
  useEffect(() => {
    const onPop = () => {
      if (!busy.current) return;
      window.clearTimeout(failsafe.current);
      pending.current = null;
      window.setTimeout(() => {
        if (busy.current) reveal();
      }, 350);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [reveal]);

  // Nettoyage si le fournisseur est démonté (changement de mise en page racine)
  useEffect(
    () => () => {
      window.clearTimeout(arriveTimer.current);
      window.clearTimeout(failsafe.current);
      window.clearTimeout(waiting.current);
      window.clearTimeout(safety.current);
      window.clearTimeout(grace.current);
    },
    [],
  );

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
