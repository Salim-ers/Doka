"use client";

import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Props = { words: string[]; className?: string; speed?: number; label?: string };

/**
 * Bande défilante. Vitesse de base constante, accélérée et inversée par le scroll
 * (la bande « suit » l'utilisateur). Mouvement réduit : bande statique.
 */
export function DokaMarquee({ words, className, speed = 60, label }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>(".marquee__track");
      if (!track) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const half = track.scrollWidth / 2;
        const loop = gsap.to(track, { x: -half, duration: half / speed, ease: "none", repeat: -1, paused: true });
        // marge pour pouvoir repartir en arrière sans buter sur t = 0
        loop.totalTime(loop.duration() * 500);
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const dir = self.direction === -1 ? -1 : 1;
            const boost = Math.min(Math.abs(self.getVelocity()) / 400, 4);
            gsap.to(loop, {
              timeScale: dir * (1 + boost),
              duration: 0.25,
              overwrite: true,
              onComplete: () => void gsap.to(loop, { timeScale: dir, duration: 0.9, overwrite: true }),
            });
          },
          onToggle: (self) => void (self.isActive ? loop.resume() : loop.pause()),
        });
        if (st.isActive) loop.resume();
        return () => {
          st.kill();
          loop.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const sequence = [...words, ...words];
  return (
    <div ref={root} className={clsx("marquee", className)} role="presentation">
      {label && <p className="sr-only">{label}</p>}
      <div className="marquee__track" aria-hidden="true">
        {[0, 1].map((k) => (
          <span key={k} className="marquee__group">
            {sequence.map((w, i) => (
              <span key={i} className="marquee__item">
                {w}
                <i className="marquee__dot" />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
