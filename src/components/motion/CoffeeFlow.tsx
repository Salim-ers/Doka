"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Props = {
  /** Couleur de la section du dessus. */
  from: string;
  /** Couleur de la section du dessous (le liquide qui monte). */
  to: string;
  /** Couleur de la vague d'avant-garde (le lait, la crema). */
  lead?: string;
  height?: string;
  className?: string;
};

/**
 * Signature 3 — The Coffee Flow.
 * Transition organique entre deux sections : le liquide de la section suivante
 * monte en vagues, précédé d'un filet plus clair (lait, crema), au rythme du scroll.
 * Dessinée en SVG ; deux chemins recalculés par frame tant qu'elle est visible.
 */
export function CoffeeFlow({ from, to, lead = "#F1E3CC", height = "clamp(160px, 26vw, 360px)", className }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const back = el.querySelector<SVGPathElement>("[data-wave='lead']");
      const front = el.querySelector<SVGPathElement>("[data-wave='main']");
      const drops = el.querySelectorAll<SVGCircleElement>("[data-drop]");
      if (!back || !front) return;

      const W = 1440;
      const H = 400;
      const N = 36;
      const wave = (level: number, amp: number, phase: number, freq: number) => {
        let d = `M0 ${H} L0 ${level}`;
        for (let i = 0; i <= N; i++) {
          const x = (i / N) * W;
          const y =
            level +
            Math.sin((i / N) * Math.PI * freq + phase) * amp +
            Math.sin((i / N) * Math.PI * (freq * 2.3) - phase * 1.4) * amp * 0.35;
          d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        return d + ` L${W} ${H} Z`;
      };

      const state = { p: 0.55, t: 0 };
      const draw = () => {
        const p = state.p;
        const level = H * (1 - p) + 10;
        const calm = Math.sin(Math.PI * Math.min(1, p)); // vagues plus fortes au milieu du passage
        front.setAttribute("d", wave(level + 18, 10 + calm * 26, state.t, 3));
        back.setAttribute("d", wave(level - 14, 8 + calm * 22, state.t * 0.8 + 1.7, 2.4));
        drops.forEach((c, i) => {
          const k = (state.t * 0.12 + i * 0.33) % 1;
          c.setAttribute("cy", String(level + 40 - k * 120));
          c.setAttribute("opacity", String(Math.max(0, 1 - k) * Math.min(1, p * 3)));
        });
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        state.p = 0;
        const tick = (_: number, dt: number) => {
          state.t += dt / 1000;
          draw();
        };
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom 35%",
          scrub: 0.6,
          onUpdate: (self) => {
            state.p = self.progress;
          },
          onToggle: (self) => (self.isActive ? gsap.ticker.add(tick) : gsap.ticker.remove(tick)),
        });
        draw();
        return () => {
          st.kill();
          gsap.ticker.remove(tick);
        };
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        state.p = 0.55;
        draw();
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className={className}
      style={{ background: from, height, position: "relative", overflow: "hidden" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <path data-wave="lead" fill={lead} d="M0 400 L0 220 L1440 220 L1440 400 Z" />
        <path data-wave="main" fill={to} d="M0 400 L0 250 L1440 250 L1440 400 Z" />
        {[0, 1, 2].map((i) => (
          <circle key={i} data-drop cx={360 + i * 380} cy={300} r={6 + i * 2} fill={lead} opacity={0} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: to }} />
    </div>
  );
}
