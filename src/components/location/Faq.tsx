"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { gsap } from "@/lib/gsap";

type Item = { q: string; a: string };

/**
 * FAQ en <details>/<summary> natifs (accessibles, fonctionnels sans JS),
 * avec ouverture et fermeture animées en hauteur.
 */
export function Faq({ items }: { items: Item[] }) {
  const root = useRef<HTMLDivElement>(null);

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const details = e.currentTarget.parentElement as HTMLDetailsElement;
    const body = details.querySelector<HTMLElement>(".faq__a");
    if (!body || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    if (details.open) {
      gsap.to(body, {
        height: 0,
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.inOut",
        onComplete: () => {
          details.open = false;
          gsap.set(body, { clearProps: "all" });
        },
      });
    } else {
      details.open = true;
      gsap.fromTo(
        body,
        { height: 0, autoAlpha: 0 },
        { height: "auto", autoAlpha: 1, duration: 0.45, ease: "doka.out", clearProps: "height" },
      );
    }
  };

  return (
    <div ref={root} className="faq">
      {items.map((it) => (
        <details key={it.q} className="faq__item">
          <summary className="faq__q" onClick={onClick}>
            <span>{it.q}</span>
            <Plus aria-hidden="true" size={22} strokeWidth={2.6} className="faq__icon" />
          </summary>
          <div className="faq__a">
            <p>{it.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
