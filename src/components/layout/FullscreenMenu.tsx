"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { DLink } from "@/components/ui/DLink";
import { mainNav, siteConfig } from "@/data/site-config";

type Props = { open: boolean; onClose: () => void; pathname: string };

/**
 * Menu plein écran orange. Ouverture : la nappe gonfle depuis le bouton (forme ronde
 * du logo), puis les liens montent un à un. Focus piégé, Échap pour fermer,
 * défilement de la page verrouillé.
 */
export function FullscreenMenu({ open, onClose, pathname }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const links = el.querySelectorAll(".fs-menu__link");
    const meta = el.querySelectorAll(".fs-menu__meta > *");
    tl.current?.kill();
    // Le reste de la page devient inerte pendant l'ouverture (clavier, lecteurs d'écran)
    const outside = document.querySelectorAll<HTMLElement>("main, footer, .site-header, .back-to-top, .dock");
    outside.forEach((n) => (n.inert = open));
    if (open) {
      document.body.classList.add("is-locked");
      gsap.set(el, { visibility: "visible" });
      if (reduce) {
        gsap.set(el, { clipPath: "circle(150% at calc(100% - 3rem) 2.5rem)" });
        gsap.set([links, meta], { clearProps: "all" });
      } else {
        tl.current = gsap
          .timeline()
          .fromTo(
            el,
            { clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)" },
            { clipPath: "circle(150% at calc(100% - 3rem) 2.5rem)", duration: 0.5, ease: "doka.inOut" },
          )
          .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.55, stagger: 0.04, ease: "doka.out" }, 0.12)
          .fromTo(meta, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, 0.3);
      }
      const first = el.querySelector<HTMLElement>("[data-autofocus]");
      requestAnimationFrame(() => first?.focus());
    } else {
      document.body.classList.remove("is-locked");
      if (reduce) {
        gsap.set(el, { visibility: "hidden" });
      } else {
        tl.current = gsap
          .timeline({ onComplete: () => void gsap.set(el, { visibility: "hidden" }) })
          .to(el, { clipPath: "circle(0% at calc(100% - 3rem) 2.5rem)", duration: 0.35, ease: "doka.inOut" });
      }
    }
    return () => {
      document.body.classList.remove("is-locked");
      outside.forEach((n) => (n.inert = false));
    };
  }, [open]);

  // Ferme le menu après navigation
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      if (open) onClose();
    }
  }, [pathname, open, onClose]);

  // Échap + piège à focus
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !root.current) return;
      const f = Array.from(root.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={root}
      id="menu-plein-ecran"
      className="fs-menu t-orange"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
    >
      <button type="button" className="fs-menu__close" onClick={onClose} data-autofocus>
        <X aria-hidden="true" size={22} strokeWidth={2.4} />
        Fermer
      </button>
      <nav aria-label="Menu principal" className="fs-menu__nav">
        <ul>
          {mainNav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href} className="fs-menu__item">
                <DLink
                  href={item.href}
                  className="fs-menu__link display"
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    if (active) onClose();
                  }}
                >
                  {item.label.toLowerCase()}
                </DLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="fs-menu__meta">
        <p className="brandline">{siteConfig.tagline.toLowerCase()}</p>
        <p>
          {siteConfig.address.full}
          <br />
          100 % à emporter
        </p>
        <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer">
          Instagram {siteConfig.instagram.handle}
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      </div>
    </div>
  );
}
