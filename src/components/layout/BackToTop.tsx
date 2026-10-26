"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Pastille « retour en haut » : apparaît après deux écrans de défilement. */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 2);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
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
