"use client";

import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatPrice } from "@/data/products";

type Props = {
  cents: number | null;
  className?: string;
  /** Compter depuis 0 quand le prix entre à l'écran. */
  countUp?: boolean;
  /** Déclencheur ScrollTrigger personnalisé (sinon : l'élément lui-même). */
  trigger?: string;
};

/**
 * Prix animé : les chiffres défilent jusqu'à leur valeur, comme une étiquette qu'on
 * retourne. Le texte final est toujours présent dans le DOM (SEO, lecteurs d'écran).
 */
export function AnimatedPrice({ cents, className, countUp = true, trigger }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const label = formatPrice(cents);

  useGSAP(
    () => {
      if (!countUp || cents === null || !ref.current) return;
      const el = ref.current.querySelector<HTMLElement>("[data-value]");
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: cents,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: trigger ?? ref.current, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = formatPrice(Math.round(obj.v / 10) * 10, { currency: false });
          },
          onComplete: () => {
            el.textContent = formatPrice(cents, { currency: false });
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [cents] },
  );

  if (cents === null) {
    return <span className={clsx("price price--unknown", className)}>{label}</span>;
  }
  return (
    <span ref={ref} className={clsx("price", className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        <span data-value>{formatPrice(cents, { currency: false })}</span>
        <span className="price__cur">{"\u00a0€"}</span>
      </span>
    </span>
  );
}
