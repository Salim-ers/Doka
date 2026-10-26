"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Pastille « retour en haut » : apparaît après deux écrans de défilement,
 * s'efface quand le footer (qui a son propre bouton) arrive à l'écran.
 */
export function BackToTop() {
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const show = scrolled && !footerVisible;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 2);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const footer = document.querySelector(".site-footer");
    const io = footer ? new IntersectionObserver(([e]) => setFooterVisible(e.isIntersecting)) : null;
    if (footer) io?.observe(footer);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      className="back-to-top"
      data-show={show ? "" : undefined}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("contenu")?.focus({ preventScroll: true });
      }}
    >
      <ArrowUp aria-hidden="true" size={20} strokeWidth={2.4} />
      <span className="sr-only">Retour en haut de page</span>
    </button>
  );
}
