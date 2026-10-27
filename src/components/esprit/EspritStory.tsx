"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { bringYourOwnCup, drinkOptions, formatPrice, productsBySlug } from "@/data/products";
import { RevealImage } from "@/components/motion/RevealImage";
import { CoffeeFlow } from "@/components/motion/CoffeeFlow";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";
import { DokaButton } from "@/components/ui/DokaButton";
import { ImageGallery } from "@/components/gallery/ImageGallery";

/**
 * L'esprit Doka — narration au scroll, construite uniquement à partir de ce que
 * la marque dit d'elle-même (visuels officiels) et de sa carte : la philosophie,
 * la signature, le lieu (devanture, guichet, rue), l'identité, la carte.
 */
export function EspritStory() {
  const root = useRef<HTMLDivElement>(null);
  const espresso = productsBySlug.espresso;
  const latte = productsBySlug.latte;
  const iced = drinkOptions.find((o) => o.id === "iced");

  const chapters = [
    {
      big: "café de spécialité",
      text: "Du café de spécialité, préparé à la demande au guichet.",
    },
    {
      big: "pour tout le monde",
      text: `Des prix tenus : l'espresso à ${formatPrice(espresso.price)}, le latte à ${formatPrice(latte.price)}.`,
    },
    {
      big: "chaud ou glacé",
      text:
        iced?.price === 0
          ? "La version glacée ne coûte rien de plus. Le lait d'avoine non plus."
          : "Chaud ou glacé, selon l'humeur.",
    },
    {
      big: "du matin au soir",
      text: "Du premier café du matin à celui de la fin de journée, rue Rambuteau.",
    },
  ];

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.classList.add("is-animated");
        // Chapitres : un seul à la fois, la phrase de la marque en géant
        const items = gsap.utils.toArray<HTMLElement>(".ch-item", el);
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".ch", start: "top top", end: "bottom bottom", scrub: 0.5 },
        });
        items.forEach((item, i) => {
          const big = item.querySelector(".ch-item__big");
          const small = item.querySelector(".ch-item__text");
          // le premier chapitre entre dès que la section arrive (jamais d'écran vide) ;
          // les suivants se relaient au scroll
          const at = i * 1.2 - 0.6;
          if (i === 0) {
            gsap
              .timeline({
                scrollTrigger: { trigger: ".ch", start: "top 65%", toggleActions: "play none none reverse" },
              })
              .fromTo(
                big,
                { yPercent: 100, autoAlpha: 0 },
                { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "doka.out" },
              )
              .fromTo(small, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.2);
            gsap.set(".ch-progress__dot", {
              scale: (k: number) => (k === 0 ? 1.8 : 1),
              backgroundColor: (k: number) => (k === 0 ? "#F14323" : "rgba(23,23,20,0.18)"),
            });
          } else {
            tl.fromTo(
              big,
              { yPercent: 100, autoAlpha: 0 },
              { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
              at,
            )
              .fromTo(small, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, at + 0.15)
              .to(
                ".ch-progress__dot",
                {
                  scale: (k: number) => (k === i ? 1.8 : 1),
                  backgroundColor: (k: number) => (k <= i ? "#F14323" : "rgba(23,23,20,0.18)"),
                  duration: 0.2,
                },
                at,
              );
          }
          if (i < items.length - 1) {
            tl.to(
              big,
              { yPercent: -100, autoAlpha: 0, duration: 0.5, ease: "power2.in" },
              Math.max(0.05, at + 0.95),
            ).to(small, { y: -20, autoAlpha: 0, duration: 0.3 }, Math.max(0.05, at + 0.95));
          }
        });
        tl.to({}, { duration: 0.4 });

        // Citation : la signature lettre par lettre
        const quote = el.querySelector(".es-quote__text");
        if (quote) {
          const split = SplitText.create(quote, { type: "chars,words", aria: "none" });
          gsap.fromTo(
            split.chars,
            { autoAlpha: 0.12 },
            {
              autoAlpha: 1,
              stagger: 0.04,
              ease: "none",
              scrollTrigger: { trigger: ".es-quote", start: "top 70%", end: "bottom 70%", scrub: true },
            },
          );
        }
        gsap.fromTo(
          ".es-stamp",
          { rotate: -30, scale: 0.4, autoAlpha: 0 },
          {
            rotate: -12,
            scale: 1,
            autoAlpha: 1,
            ease: "doka.pop",
            duration: 1,
            scrollTrigger: { trigger: ".es-board", start: "top 70%", once: true },
          },
        );
        return () => el.classList.remove("is-animated");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="es">
      {/* Chapitres */}
      <section id="philosophie" className="ch t-cream" aria-labelledby="ch-title">
        <h2 id="ch-title" className="sr-only">
          Ce que Doka dit de lui-même
        </h2>
        <div className="ch-sticky">
          <ol className="ch-list">
            {chapters.map((c) => (
              <li key={c.big} className="ch-item">
                <p className="ch-item__big display">{c.big}</p>
                <p className="ch-item__text lead">{c.text}</p>
              </li>
            ))}
          </ol>
          <div className="ch-progress" aria-hidden="true">
            {chapters.map((c) => (
              <span key={c.big} className="ch-progress__dot" />
            ))}
          </div>
        </div>
      </section>

      <CoffeeFlow from="var(--cream)" to="var(--orange)" lead="#FFB199" />

      {/* Signature */}
      <section className="es-quote t-orange" aria-label="Signature">
        <blockquote>
          <p className="es-quote__text display">fait pour tous les jours.</p>
        </blockquote>
      </section>
      <CoffeeFlow from="var(--orange)" to="var(--cream)" lead="#FFD2C2" />

      {/* Le lieu : devanture, guichet, rue */}
      <ImageGallery />

      {/* Identité */}
      <section className="es-id t-paper" aria-labelledby="id-title">
        <div className="es-id__copy">
          <AnimatedHeading id="id-title" className="display type-2" mode="words">
            un orange qu&apos;on repère de loin
          </AnimatedHeading>
          <p className="lead">
            Une devanture rouge-orangé sur la rue, des lettres rondes, du crème et du noir. L&apos;identité Doka se lit
            en une seconde, comme on attrape un café en passant.
          </p>
        </div>
        <RevealImage
          id="identite"
          reveal="circle"
          className="es-id__img"
          sizes="(max-width: 900px) 92vw, 60vw"
          parallax={0}
        />
      </section>

      {/* La carte comme preuve */}
      <section className="es-board t-cream" aria-labelledby="board-title">
        <div className="es-board__copy">
          <AnimatedHeading id="board-title" className="display type-2" mode="words">
            une carte qui tient sur un tableau
          </AnimatedHeading>
          <p className="lead">
            Des classiques bien faits, une spécialité, quelques options. Pas besoin de plus pour un bon café quotidien.
          </p>
          <p className="es-stamp" aria-label={`${bringYourOwnCup.label} : ${formatPrice(-bringYourOwnCup.discount)}`}>
            <span className="price">{formatPrice(-bringYourOwnCup.discount)}</span>
            <span>avec ton gobelet</span>
          </p>
          <div className="es-board__ctas">
            <DokaButton href="/la-carte" variant="orange" size="lg">
              Voir la carte
            </DokaButton>
            <DokaButton href="/nous-trouver" variant="ink" size="lg">
              Nous trouver
            </DokaButton>
          </div>
        </div>
        <RevealImage
          id="carteOfficielle"
          reveal="rise"
          fit="contain"
          className="es-board__img"
          sizes="(max-width: 900px) 92vw, 58vw"
          parallax={0}
        />
      </section>
    </div>
  );
}
