"use client";

import { useEffect, useRef } from "react";
import { createTakeawayScene } from "@/components/home/hero/scene/takeaway-scene";

/** Banc d'essai de la scène 3D (posters, tests visuels). Non publié en production. */
export function LabScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const freeze = q.get("t");
    const scroll = Number(q.get("s") ?? 0);
    const quality = (q.get("q") as "high" | "low" | null) ?? "high";
    if (ref.current && q.get("transparent")) {
      ref.current.style.background = "transparent";
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
      document.querySelectorAll<HTMLElement>("body > *:not(main), main > *:not(canvas)").forEach((e) => {
        if (!e.contains(ref.current)) e.style.display = "none";
      });
    }
    let s: ReturnType<typeof createTakeawayScene> | null = null;
    document.fonts.ready.then(() => {
      if (!ref.current) return;
      s = createTakeawayScene(ref.current, { quality, freezeAt: freeze ? Number(freeze) : undefined });
      s.setScroll(scroll);
      s.setActive(true);
      // Enregistrement image par image (scripts/render-hero-video.mjs)
      (window as unknown as { __doka?: unknown }).__doka = s;
      window.setTimeout(() => document.body.setAttribute("data-ready", "1"), 1500);
    });
    return () => s?.dispose();
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", background: "#FFFBEA", zIndex: 1000 }}
    />
  );
}
