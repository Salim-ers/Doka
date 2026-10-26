"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { media } from "@/data/media";
import { formatPrice, productsBySlug, drinkOptions } from "@/data/products";
import { DokaButton } from "@/components/ui/DokaButton";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";

/**
 * Section matcha : le vert prend le relais de l'orange le temps d'une section.
 * La photo officielle s'ouvre depuis une pastille (le point du « o » de doka)
 * jusqu'au cadre complet, pendant que le mot « matcha » géant glisse derrière.
 */
export function MatchaSection() {
  const root = useRef<HTMLElement>(null);
  const m = media.matcha;
  const latte = productsBySlug["matcha-latte"];
  const cloud = productsBySlug["nuage-coco-matcha"];
  const iced = drinkOptions.find((o) => o.id === "iced");
  const oat = drinkOptions.find((o) => o.id === "oat");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: ".matcha-frame", start: "top 95%", end: "center 55%", scrub: 0.6 },
          })
          .fromTo(
            ".matcha-frame",
            { clipPath: "circle(6% at 50% 50%)" },
            { clipPath: "circle(75% at 50% 50%)", ease: "power2.inOut" },
          )
          .fromTo(".matcha-frame img", { scale: 1.35 }, { scale: 1, ease: "power2.out" }, 0);
        gsap.fromTo(
          ".matcha-giant",
          { xPercent: 12 },
          {
            xPercent: -22,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.from(".matcha-facts > *", {
          y: 30,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.8,
          scrollTrigger: { trigger: ".matcha-facts", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="matcha t-matcha" aria-labelledby="matcha-title">
      <p className="matcha-giant display" aria-hidden="true">
        matcha matcha
      </p>
      <div className="matcha-grid">
        <div className="matcha-copy">
          <AnimatedHeading id="matcha-title" className="display type-1" mode="chars">
            doka matcha
          </AnimatedHeading>
          <p className="lead">Ta boisson préférée. Chaud ou glacé, au même prix.</p>
          <ul className="matcha-facts">
            <li>
              <span className="price">{formatPrice(latte.price)}</span> le {latte.name.toLowerCase()}
            </li>
            <li>
              {iced?.label} et {oat?.label.toLowerCase()}{" "}
              {iced?.price === 0 && oat?.price === 0
                ? "sans supplément"
                : `: ${formatPrice(iced?.price ?? 0, { signed: true })}`}
            </li>
            <li>
              <span className="price">{formatPrice(cloud.price)}</span> le {cloud.name.toLowerCase()}, la spécialité de
              la carte
            </li>
          </ul>
          <div className="matcha-ctas">
            <DokaButton href={`/produits/${latte.slug}`} variant="cream">
              Voir le {latte.name.toLowerCase()}
            </DokaButton>
            <DokaButton href={`/produits/${cloud.slug}`} variant="outline">
              {cloud.name}
            </DokaButton>
          </div>
        </div>
        <figure className="matcha-figure">
          <div className="matcha-frame">
            <Image
              src={m.file}
              alt={m.alt}
              fill
              sizes="(max-width: 900px) 92vw, 52vw"
              quality={80}
              style={{ objectFit: "cover", objectPosition: m.focus }}
            />
          </div>
          <figcaption className="small">Visuel officiel doka matcha, en version glacée.</figcaption>
        </figure>
      </div>
    </section>
  );
}
