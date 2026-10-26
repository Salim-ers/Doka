"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setCurtainCovering } from "@/lib/entrance";
import { DokaLogo } from "@/components/brand/DokaLogo";
import { mainNav, legalNav } from "@/data/site-config";
import { productsBySlug } from "@/data/products";

type Origin = { x: number; y: number };

/** Durée minimale (s) de couverture : le logo a fini de se poser avant de s'envoler. */
const MIN_COVER = 0.95;
type Ctx = { navigate: (href: string, origin?: Origin) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export const usePageTransition = () => useContext(TransitionContext);

/** Nom de la page d'arrivée, affiché sous le logo pendant la transition. */
function labelFor(pathname: string) {
  const product = pathname.match(/^\/produits\/([^/]+)/)?.[1];
  if (product) return productsBySlug[product]?.name.toLowerCase() ?? "";
  const page = [...mainNav, ...legalNav].find((n) => n.href === pathname);
  return page ? page.label.toLowerCase() : "";
}

/**
 * Transition Doka, à chaque navigation interne :
 * 1. une nappe orange s'ouvre en cercle depuis le point cliqué (le « point » des lettres du logo) ;
 * 2. les quatre lettres du logo se posent une à une, avec le nom de la page d'arrivée ;
 * 3. la page change sous la nappe, puis les lettres s'envolent et la nappe se lève en s'arrondissant.
 * - La page n'est jamais révélée avant d'être prête ; si elle tarde trop, navigation classique.
 * - Clics pendant une transition : le dernier gagne ; précédent / suivant du navigateur : sans nappe.
 * - Mouvement réduit : navigation directe.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const pending = useRef<string | null>(null);
  const nextTarget = useRef("");
  const pushed = useRef(false);
  const busy = useRef(false);
  const startedAt = useRef(0);
  const failsafe = useRef(0);
  const tl = useRef<gsap.core.Timeline | null>(null);

  const letters = () => logo.current?.querySelectorAll("[data-letter]") ?? [];

  const reveal = useCallback(() => {
    const el = curtain.current;
    if (!el) return;
    window.clearTimeout(failsafe.current);
    tl.current?.kill();
    tl.current = gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { visibility: "hidden", clearProps: "transform,clipPath,borderRadius" });
          busy.current = false;
          setCurtainCovering(false);
          ScrollTrigger.refresh();
        },
      })
      .to(
        letters(),
        {
          yPercent: -70,
          autoAlpha: 0,
          rotate: (i: number) => (i % 2 ? 6 : -6),
          duration: 0.3,
          stagger: 0.035,
          ease: "power2.in",
        },
        0,
      )
      .to(label.current, { autoAlpha: 0, y: -10, duration: 0.22, ease: "power2.in" }, 0)
      .fromTo(
        el,
        { yPercent: 0, borderRadius: "0 0 0% 0% / 0 0 0px 0px" },
        {
          yPercent: -100,
          borderRadius: `0 0 50% 50% / 0 0 ${Math.round(window.innerHeight * 0.28)}px ${Math.round(window.innerHeight * 0.28)}px`,
          duration: 0.65,
          ease: "doka.inOut",
        },
        0.12,
      );
  }, []);

  const navigate = useCallback(
    (href: string, origin?: Origin) => {
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
      if (reduce || !el) {
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

      // le cercle part du point cliqué (ou du centre au clavier)
      const x = origin && (origin.x || origin.y) ? origin.x : window.innerWidth / 2;
      const y = origin && (origin.x || origin.y) ? origin.y : window.innerHeight / 2;
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      tl.current?.kill();
      gsap.set(el, { visibility: "visible", yPercent: 0, borderRadius: 0 });
      tl.current = gsap
        .timeline()
        .fromTo(
          el,
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${Math.ceil(r)}px at ${x}px ${y}px)`, duration: 0.55, ease: "doka.inOut" },
        )
        .fromTo(
          letters(),
          { yPercent: 110, autoAlpha: 1, rotate: (i: number) => [-10, 8, -6, 10][i] ?? 0 },
          { yPercent: 0, rotate: 0, duration: 0.5, stagger: 0.05, ease: "doka.pop" },
          0.18,
        )
        .fromTo(label.current, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "doka.out" }, 0.35)
        .add(() => {
          pushed.current = true;
          router.push(nextTarget.current);
          // filet de sécurité : si la page n'arrive pas, navigation classique
          failsafe.current = window.setTimeout(() => window.location.assign(nextTarget.current), 8000);
        }, 0.55);
    },
    [router],
  );

  // La nouvelle page est rendue : on la laisse peindre, on tient le logo un instant, on lève la nappe
  useEffect(() => {
    if (!pending.current || pending.current !== pathname) return;
    pending.current = null;
    window.clearTimeout(failsafe.current);
    // haut de la nouvelle page, ou l'ancre demandée (ex. /esprit-doka#le-lieu)
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const anchor = hash ? document.getElementById(hash) : null;
    if (anchor) anchor.scrollIntoView();
    else window.scrollTo(0, 0);
    const elapsed = (performance.now() - startedAt.current) / 1000;
    const wait = Math.max(0.1, MIN_COVER - elapsed);
    const id = window.setTimeout(() => requestAnimationFrame(reveal), wait * 1000);
    return () => window.clearTimeout(id);
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
        <div className="page-curtain__inner">
          <div ref={logo} className="page-curtain__logo">
            <DokaLogo title={null} />
          </div>
          <p ref={label} className="page-curtain__label" />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
