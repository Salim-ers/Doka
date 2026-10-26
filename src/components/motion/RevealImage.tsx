"use client";

import Image from "next/image";
import { useRef } from "react";
import clsx from "clsx";
import { gsap, useGSAP } from "@/lib/gsap";
import { media, type MediaId } from "@/data/media";

type Reveal = "rise" | "circle" | "wipe" | "pour" | "none";

type Props = {
  id: MediaId;
  className?: string;
  sizes: string;
  reveal?: Reveal;
  /** Amplitude du parallaxe interne (en % de la hauteur). 0 = aucun. */
  parallax?: number;
  priority?: boolean;
  /** Point focal surchargé pour ce cadrage. */
  focus?: string;
  /** Recadrage autorisé (cover) ; sinon l'image est entière (contain). */
  fit?: "cover" | "contain";
  alt?: string;
};

/**
 * Photo authentique Doka révélée par un masque :
 * - rise : le cadre s'ouvre de bas en haut
 * - circle : un cercle s'ouvre depuis le centre (les « points » du logo)
 * - wipe : volet latéral
 * - pour : le cadre s'ouvre de haut en bas, comme un café qui coule
 * L'image intérieure se déplace légèrement au scroll (profondeur).
 */
export function RevealImage({
  id,
  className,
  sizes,
  reveal = "rise",
  parallax = 8,
  priority = false,
  focus,
  fit = "cover",
  alt,
}: Props) {
  const m = media[id];
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const img = el.querySelector(".reveal-img__inner");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const from: Record<Reveal, string> = {
          rise: "inset(100% 0% 0% 0% round var(--r-card))",
          pour: "inset(0% 0% 100% 0% round var(--r-card))",
          wipe: "inset(0% 100% 0% 0% round var(--r-card))",
          circle: "circle(0% at 50% 50%)",
          none: "inset(0% 0% 0% 0% round var(--r-card))",
        };
        const to = reveal === "circle" ? "circle(75% at 50% 50%)" : "inset(0% 0% 0% 0% round var(--r-card))";
        if (reveal !== "none") {
          gsap.fromTo(
            el,
            { clipPath: from[reveal] },
            {
              clipPath: to,
              duration: 1.3,
              ease: "doka.inOut",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
          gsap.fromTo(
            img,
            { scale: 1.25 },
            { scale: 1, duration: 1.6, ease: "doka.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          );
        }
        if (parallax > 0) {
          gsap.fromTo(
            el.querySelector(".reveal-img__parallax"),
            { yPercent: -parallax / 2 },
            {
              yPercent: parallax / 2,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={clsx("reveal-img", fit === "contain" && "reveal-img--contain", className)}>
      <div className="reveal-img__parallax" style={{ inset: parallax ? `-${parallax / 2}% 0` : 0 }}>
        <div className="reveal-img__inner">
          <Image
            src={m.file}
            alt={alt ?? m.alt}
            fill
            sizes={sizes}
            quality={80}
            priority={priority}
            style={{ objectFit: fit, objectPosition: focus ?? m.focus }}
          />
        </div>
      </div>
    </div>
  );
}
