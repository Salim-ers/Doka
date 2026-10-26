"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatPrice, productsBySlug } from "@/data/products";
import { RevealImage } from "@/components/motion/RevealImage";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { DokaButton } from "@/components/ui/DokaButton";

/**
 * Coffee moment : la photo d'extraction s'ouvre de haut en bas, comme le café qui coule.
 * Un filet graphique (SVG, pas sur la photo) se dessine en parallèle au rythme du scroll.
 */
export function CoffeeMoment() {
  const root = useRef<HTMLElement>(null);
  const espresso = productsBySlug.espresso;
  const double = productsBySlug.double;
  const americano = productsBySlug.americano;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const path = el.querySelector<SVGPathElement>(".cm-stream path");
        if (path) {
          const len = path.getTotalLength();
          gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 70%", end: "bottom 60%", scrub: 0.5 },
          });
        }
        gsap.from(".cm-lines > *", {
          y: 40,
          autoAlpha: 0,
          stagger: 0.14,
          duration: 0.9,
          scrollTrigger: { trigger: ".cm-lines", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="cm" aria-labelledby="cm-title">
      <svg className="cm-stream" viewBox="0 0 60 1000" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M30 0 C 18 120, 42 220, 30 340 S 18 560, 30 680 S 42 880, 30 1000"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <AnimatedHeading id="cm-title" className="display type-giant cm-title" mode="chars">
        coffee time.
      </AnimatedHeading>
      <div className="cm-grid">
        <div className="cm-copy">
          <div className="cm-lines">
            <p className="lead">Un espresso tiré à la demande, directement dans le gobelet, et c&apos;est parti.</p>
            <dl className="cm-prices">
              {[espresso, double, americano].map((p) => (
                <div key={p.slug}>
                  <dt>{p.name}</dt>
                  <dd className="price">{formatPrice(p.price)}</dd>
                </div>
              ))}
            </dl>
            <div>
              <DokaButton href="/produits/espresso" variant="orange">
                Voir l&apos;espresso
              </DokaButton>
            </div>
          </div>
        </div>
        <RevealImage
          id="espresso"
          reveal="pour"
          className="cm-photo"
          sizes="(max-width: 900px) 92vw, 58vw"
          parallax={10}
        />
      </div>
    </section>
  );
}
