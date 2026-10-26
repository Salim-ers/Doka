"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { products } from "@/data/products";
import { ProductArt } from "./ProductVisual";

/**
 * Le nuancier de la carte : chaque boisson vue de dessus, en pastilles qui
 * roulent à des vitesses différentes au scroll (profondeur), comme des gobelets
 * alignés sur le comptoir.
 */
export function ProductsHeroPalette() {
  const root = useRef<HTMLDivElement>(null);
  const tones = Array.from(new Set(products.map((p) => p.tone)));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const dots = gsap.utils.toArray<HTMLElement>(".palette__dot", root.current);
        gsap.from(dots, { scale: 0, rotate: -90, duration: 1, stagger: 0.06, ease: "doka.pop", delay: 0.4 });
        dots.forEach((d, i) => {
          gsap.to(d, {
            yPercent: (i % 3) * -35 - 20,
            rotate: i % 2 ? 50 : -50,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 80%", end: "bottom top", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="palette" aria-hidden="true">
      {tones.map((t) => (
        <span key={t} className="palette__dot">
          <ProductArt tone={t} />
        </span>
      ))}
    </div>
  );
}
