"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { DokaLogo } from "@/components/brand/DokaLogo";

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });

export const usePageTransition = () => useContext(TransitionContext);

/**
 * Transition Doka : une nappe orange monte, le logo apparaît, la page suivante est
 * révélée par le haut. ~0,35 s pour couvrir, ~0,5 s pour révéler.
 * - Jamais bloquante : si la nouvelle route tarde, la nappe se retire après 1,4 s.
 * - Précédent / suivant du navigateur : navigation directe, sans nappe.
 * - Mouvement réduit : navigation directe.
 */
export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);
  const failsafe = useRef<number>(0);

  const reveal = useCallback(() => {
    const el = curtain.current;
    if (!el) return;
    window.clearTimeout(failsafe.current);
    gsap.killTweensOf([el, logo.current]);
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { yPercent: 100, visibility: "hidden" });
          busy.current = false;
          ScrollTrigger.refresh();
        },
      })
      .to(logo.current, { yPercent: -40, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0)
      .to(el, { yPercent: -100, duration: 0.55, ease: "doka.inOut" }, 0.05);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const target = url.pathname + url.search + url.hash;
      if (url.pathname === window.location.pathname) {
        if (url.hash) {
          document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", target);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = curtain.current;
      if (reduce || !el || busy.current) {
        router.push(target);
        return;
      }
      busy.current = true;
      pending.current = url.pathname;
      router.prefetch(target);
      gsap.set(el, { visibility: "visible", yPercent: 100 });
      gsap.set(logo.current, { yPercent: 40, autoAlpha: 0 });
      gsap
        .timeline()
        .to(el, { yPercent: 0, duration: 0.38, ease: "doka.inOut" })
        .to(logo.current, { yPercent: 0, autoAlpha: 1, duration: 0.3, ease: "doka.out" }, 0.2)
        .add(() => {
          router.push(target);
          failsafe.current = window.setTimeout(reveal, 1400);
        });
    },
    [router, reveal],
  );

  useEffect(() => {
    if (!pending.current) return;
    if (pending.current !== pathname) return;
    pending.current = null;
    // Laisser la nouvelle page peindre une frame avant de lever la nappe
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        reveal();
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
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
        <div ref={logo} className="page-curtain__logo">
          <DokaLogo title={null} />
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
