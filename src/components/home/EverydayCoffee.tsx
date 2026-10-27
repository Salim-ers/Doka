"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { everydayLadder, formatPrice, priceRange, productsBySlug } from "@/data/products";
import { DLink } from "@/components/ui/DLink";

/**
 * Signature 2 — Le café du quotidien.
 * Section collante pilotée par le scroll : trois phrases s'empilent (« le bon café, /
 * tous les jours, / dès 1,50 € »), puis le prix quitte la phrase et grossit jusqu'à
 * occuper l'écran en comptant depuis zéro. Enfin l'échelle des prix du quotidien se
 * dessine et le fond passe de l'orange au crème.
 * Sans animation : les trois blocs s'affichent simplement les uns sous les autres.
 */
export function EverydayCoffee() {
  const root = useRef<HTMLElement>(null);
  const ladder = everydayLadder.map((s) => productsBySlug[s]);
  const max = Math.max(...ladder.map((p) => p.price ?? 0));
  const espresso = productsBySlug.espresso;
  const range = priceRange();
  const priceLabel = formatPrice(espresso.price, { currency: false });

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        el.classList.add("is-animated");
        const giant = el.querySelector<HTMLElement>(".ev-giant");
        const value = el.querySelector<HTMLElement>(".ev-giant [data-value]");
        const inline = el.querySelector<HTMLElement>(".ev-inline-price");
        if (!giant || !value || !inline) return;
        const counter = { v: 0 };
        // Position de départ du grand prix : superposé au prix de la phrase (mesuré sur le
        // chiffre seul, pas sur tout le bloc avec sa légende)
        const giantPrice = giant.querySelector<HTMLElement>(".ev-giant__price") ?? giant;
        const startVars = () => {
          const a = inline.getBoundingClientRect();
          const b = giantPrice.getBoundingClientRect();
          const s = a.height / b.height || 0.2;
          return { x: a.left - b.left, y: a.top - b.top, scale: s };
        };
        let from = { x: 0, y: 0, scale: 0.2 };
        // La première ligne entre dès que la section arrive : jamais d'écran orange vide
        gsap.fromTo(
          ".ev-line--1 .ev-line__in",
          { yPercent: 108 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: "doka.out",
            scrollTrigger: { trigger: el, start: "top 65%", toggleActions: "play none none reverse" },
          },
        );
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              gsap.set(giant, { x: 0, y: 0, scale: 1 });
              from = startVars();
            },
          },
        });
        from = startVars();
        tl.fromTo(".ev-line--2 .ev-line__in", { yPercent: 108 }, { yPercent: 0, duration: 0.6, ease: "power2.out" }, 0)
          .fromTo(
            ".ev-line--3 .ev-line__in",
            { yPercent: 108 },
            { yPercent: 0, duration: 0.6, ease: "power2.out" },
            0.45,
          )
          .to(".ev-note", { autoAlpha: 1, duration: 0.3 }, 0.8)
          // la légende s'efface avant que le prix ne grandisse : rien ne se superpose
          .to(".ev-note", { autoAlpha: 0, y: -20, duration: 0.25 }, 1.2)
          // le prix sort de la phrase et prend tout l'écran
          .set(giant, { autoAlpha: 1 }, 1.45)
          .set(inline, { autoAlpha: 0 }, 1.45)
          .fromTo(
            giant,
            { x: () => from.x, y: () => from.y, scale: () => from.scale },
            { x: 0, y: 0, scale: 1, duration: 1, ease: "power2.inOut" },
            1.45,
          )
          .to(".ev-title", { autoAlpha: 0, y: -30, duration: 0.4 }, 1.45)
          .to(
            counter,
            {
              v: espresso.price ?? 0,
              duration: 1,
              onUpdate: () => {
                value.textContent = formatPrice(Math.round(counter.v / 10) * 10, { currency: false });
              },
            },
            1.45,
          )
          .fromTo(".ev-giant__note", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 2.3)
          // le grand prix s'en va entièrement, puis le fond passe au crème et l'échelle se dessine
          .to(giant, { autoAlpha: 0, yPercent: -30, duration: 0.45 }, 2.95)
          .to(el, { "--ev-bg": "#FFFBEA", "--ev-fg": "#171714", duration: 0.5 }, 3.3)
          .fromTo(".ev-ladder", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 3.6)
          .fromTo(
            ".ev-ladder__row",
            { autoAlpha: 0, x: -30 },
            { autoAlpha: 1, x: 0, stagger: 0.12, duration: 0.3 },
            3.65,
          )
          .fromTo(
            ".ev-ladder__bar",
            { scaleX: 0 },
            { scaleX: 1, stagger: 0.12, duration: 0.5, ease: "power2.out", transformOrigin: "0% 50%" },
            3.7,
          )
          .to({}, { duration: 0.5 });
        return () => {
          el.classList.remove("is-animated");
          value.textContent = priceLabel;
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="everyday" className="ev" aria-labelledby="ev-title">
      <div className="ev-sticky">
        <div className="ev-stack">
          <h2 id="ev-title" className="display ev-title">
            <span className="ev-line ev-line--1">
              <span className="ev-line__in">le bon café,</span>
            </span>{" "}
            <span className="ev-line ev-line--2">
              <span className="ev-line__in">tous les jours,</span>
            </span>{" "}
            <span className="ev-line ev-line--3">
              <span className="ev-line__in">
                dès <span className="ev-inline-price">{priceLabel}&nbsp;€</span>
              </span>
            </span>
          </h2>
          <p className="ev-note">
            Le prix de l&apos;espresso Doka. Du café de spécialité, à un prix pensé pour en reprendre un demain.
          </p>
        </div>

        <div className="ev-giant" aria-hidden="true">
          <p className="ev-giant__price display">
            <span data-value>{priceLabel}</span>
            <span className="ev-giant__cur">€</span>
          </p>
          <p className="ev-giant__note brandline">l&apos;espresso. tous les jours.</p>
        </div>

        <div className="ev-ladder">
          <p className="ev-ladder__title display">le café du quotidien</p>
          <ol className="ev-ladder__list" aria-label="Quelques prix de la carte">
            {ladder.map((p) => (
              <li key={p.slug} className="ev-ladder__row">
                <DLink href={`/produits/${p.slug}`} className="ev-ladder__name">
                  {p.name}
                </DLink>
                <span className="ev-ladder__track" aria-hidden="true">
                  <span className="ev-ladder__bar" style={{ width: `${((p.price ?? 0) / max) * 100}%` }} />
                </span>
                <span className="price ev-ladder__price">{formatPrice(p.price)}</span>
              </li>
            ))}
          </ol>
          <DLink href="/la-carte" className="ev-ladder__more">
            Toute la carte, de {formatPrice(range.min)} à {formatPrice(range.max)}
          </DLink>
        </div>
      </div>
    </section>
  );
}
