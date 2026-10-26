"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
  gsap.defaults({ ease: "doka.out", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Courbes Doka : un « out » rond et confiant, un « in-out » liquide, un rebond de pastille. */
gsap.registerEase?.("doka.out", (p: number) => 1 - Math.pow(1 - p, 4));
gsap.registerEase?.("doka.inOut", (p: number) => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2));
gsap.registerEase?.("doka.pop", (p: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
});

export const motion = {
  fast: 0.22,
  base: 0.6,
  slow: 1.1,
  stagger: 0.06,
} as const;

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
