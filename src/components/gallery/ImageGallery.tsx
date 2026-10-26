"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Expand } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { media } from "@/data/media";
import { siteConfig } from "@/data/site-config";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { Lightbox } from "./Lightbox";

const PLACE = ["devantureSoir", "gobeletRue"] as const;

/**
 * Le lieu, dans « L'esprit Doka » : la devanture s'agrandit jusqu'au plein écran,
 * un texte sur le guichet, puis la rue défile latéralement.
 * Chaque photo s'ouvre dans la visionneuse.
 */
export function ImageGallery() {
  const root = useRef<HTMLDivElement>(null);
  const [lb, setLb] = useState<number | null>(null);
  const soir = media.devantureSoir;
  const rue = media.gobeletRue;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // 1. la devanture s'agrandit jusqu'au plein cadre
        gsap.fromTo(
          ".cs-open__frame",
          { clipPath: "inset(14% 22% 14% 22% round 2.4rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0rem)",
            ease: "none",
            scrollTrigger: { trigger: ".cs-open", start: "top top", end: "bottom bottom", scrub: 0.4 },
          },
        );
        gsap.fromTo(
          ".cs-open__frame img",
          { scale: 1.18 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: ".cs-open", start: "top top", end: "bottom bottom", scrub: 0.4 },
          },
        );
        gsap.fromTo(
          ".cs-open__title",
          { yPercent: 40, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: ".cs-open", start: "top 60%", end: "top top", scrub: true },
          },
        );
        // 2. la rue défile latéralement (amplitude limitée)
        gsap.fromTo(
          ".cs-street__img",
          { xPercent: 0 },
          {
            xPercent: -16,
            ease: "none",
            scrollTrigger: { trigger: ".cs-street", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} id="le-lieu" className="cs">
      <section className="cs-open" aria-labelledby="cs-title">
        <div className="cs-open__sticky">
          <div className="cs-open__frame">
            <Image
              src={soir.file}
              alt={soir.alt}
              fill
              sizes="100vw"
              quality={80}
              style={{ objectFit: "cover", objectPosition: soir.focus }}
            />
          </div>
          <h2 id="cs-title" className="cs-open__title display">
            le lieu
          </h2>
          <button type="button" className="cs-zoom" onClick={() => setLb(0)}>
            <Expand aria-hidden="true" size={18} strokeWidth={2.4} />
            Agrandir la photo
          </button>
        </div>
      </section>

      <section className="cs-text t-cream" aria-labelledby="cs-guichet">
        <AnimatedHeading id="cs-guichet" className="display type-1" mode="words">
          un guichet sur la rue.
        </AnimatedHeading>
        <div className="cs-text__body prose-doka">
          <p>
            Doka, c&apos;est une devanture rouge-orangé au {siteConfig.address.street}, dans le Marais. Pas de salle :
            on commande au guichet, on récupère son gobelet et on repart avec.
          </p>
          <p>Tout est pensé pour ça : un bon café, vite servi, à emporter dans sa journée.</p>
        </div>
      </section>

      <section className="cs-street t-ink" aria-labelledby="cs-main">
        <div className="cs-street__frame">
          <div className="cs-street__img">
            <Image
              src={rue.file}
              alt={rue.alt}
              fill
              sizes="130vw"
              quality={80}
              style={{ objectFit: "cover", objectPosition: rue.focus }}
            />
          </div>
          <button type="button" className="cs-zoom cs-zoom--light" onClick={() => setLb(1)}>
            <Expand aria-hidden="true" size={18} strokeWidth={2.4} />
            Agrandir la photo
          </button>
        </div>
        <AnimatedHeading id="cs-main" className="display type-2 cs-street__title" mode="words">
          un café, ça se passe de main en main.
        </AnimatedHeading>
      </section>

      <Lightbox items={[...PLACE]} index={lb} onIndex={setLb} />
    </div>
  );
}
