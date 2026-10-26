"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { RevealImage } from "@/components/motion/RevealImage";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { DokaButton } from "@/components/ui/DokaButton";
import { DokaMarquee } from "@/components/ui/DokaMarquee";

/**
 * Le coin gourmand : la bande défilante ouvre la section, puis la photo du présentoir
 * s'ouvre en volet. Les pois rouges reprennent le vrai revêtement du présentoir.
 * Aucun parfum ni prix n'est inventé.
 */
export function CoinGourmand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".cg-dots",
          { backgroundPositionY: "0px" },
          {
            backgroundPositionY: "-180px",
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.from(".cg-copy > *", {
          y: 30,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.8,
          scrollTrigger: { trigger: ".cg-copy", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="cg t-paper" aria-labelledby="cg-title">
      <DokaMarquee
        className="cg-marquee"
        words={["coffee", "matcha", "cookies", "every day"]}
        label="Coffee, matcha, cookies, every day."
      />
      <div className="cg-grid">
        <div className="cg-dots" aria-hidden="true" />
        <AnimatedHeading id="cg-title" className="display type-1 cg-title" mode="words">
          le coin gourmand
        </AnimatedHeading>
        <RevealImage
          id="cookies"
          reveal="wipe"
          className="cg-photo"
          sizes="(max-width: 900px) 92vw, 62vw"
          parallax={6}
        />
        <div className="cg-copy">
          <p className="lead">Des cookies sur le présentoir, juste à côté du guichet. Avec le café, ou à la place.</p>
          <p className="small muted">Parfums et prix à découvrir au comptoir.</p>
          <div>
            <DokaButton href="/produits#sweet" variant="ink">
              Voir les gourmandises
            </DokaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
