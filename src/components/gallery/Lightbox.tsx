"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { media, type MediaId } from "@/data/media";

type Props = { items: MediaId[]; index: number | null; onIndex: (i: number | null) => void };

/**
 * Visionneuse accessible : dialogue modal, focus piégé, Échap pour fermer,
 * flèches clavier et boutons pour naviguer, balayage tactile, retour du focus
 * sur l'élément d'origine à la fermeture.
 */
export function Lightbox({ items, index, onIndex }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement;
    document.body.classList.add("is-locked");
    const el = root.current;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(el.querySelector(".lightbox__stage"), { scale: 0.94 }, { scale: 1, duration: 0.5, ease: "doka.out" });
    }
    el?.querySelector<HTMLElement>("[data-close]")?.focus();
    return () => {
      document.body.classList.remove("is-locked");
      opener.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      else if (e.key === "ArrowRight") onIndex(((index ?? 0) + 1) % items.length);
      else if (e.key === "ArrowLeft") onIndex(((index ?? 0) - 1 + items.length) % items.length);
      else if (e.key === "Tab" && root.current) {
        const f = Array.from(root.current.querySelectorAll<HTMLElement>("button"));
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, items.length, onIndex]);

  if (!open || typeof document === "undefined") return null;
  const m = media[items[index]];

  return createPortal(
    <div
      ref={root}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo agrandie"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onIndex((((index + (dx < 0 ? 1 : -1)) % items.length) + items.length) % items.length);
        touchX.current = null;
      }}
    >
      <div className="lightbox__bar">
        <p className="lightbox__count" aria-live="polite">
          {index + 1} / {items.length}
        </p>
        <button type="button" className="lightbox__btn" data-close onClick={() => onIndex(null)}>
          <X aria-hidden="true" size={18} strokeWidth={2.4} /> Fermer
        </button>
      </div>
      <div className="lightbox__stage">
        <div className="lightbox__img">
          <Image src={m.file} alt={m.alt} fill sizes="100vw" quality={90} style={{ objectFit: "contain" }} />
        </div>
      </div>
      <div className="lightbox__bar">
        <p className="lightbox__caption">{m.description}</p>
        {items.length > 1 && (
          <div className="lightbox__nav">
            <button
              type="button"
              className="lightbox__btn"
              onClick={() => onIndex((index - 1 + items.length) % items.length)}
            >
              <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.4} />
              <span className="sr-only">Photo précédente</span>
            </button>
            <button type="button" className="lightbox__btn" onClick={() => onIndex((index + 1) % items.length)}>
              <ChevronRight aria-hidden="true" size={18} strokeWidth={2.4} />
              <span className="sr-only">Photo suivante</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
