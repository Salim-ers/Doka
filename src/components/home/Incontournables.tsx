"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { signatureSelection, formatPrice, productsBySlug } from "@/data/products";
import { DLink } from "@/components/ui/DLink";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProductVisual } from "@/components/products/ProductVisual";
import { AnimatedHeading } from "@/components/motion/AnimatedHeading";

/**
 * Les incontournables : un slider éditorial.
 * - Grand écran : la section reste collée et le scroll vertical fait glisser la frise
 *   horizontalement ; chaque affiche se redresse en arrivant au centre.
 * - Mobile / tactile : carrousel natif à balayer (scroll-snap), aucune capture du scroll.
 */
export function Incontournables() {
  const root = useRef<HTMLElement>(null);
  const items = signatureSelection.map((s) => productsBySlug[s]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        el.classList.add("is-scrubbed");
        const track = el.querySelector<HTMLElement>(".inc-track");
        if (!track) return;
        const cards = gsap.utils.toArray<HTMLElement>(".inc-card", el);
        const distance = () => track.scrollWidth - window.innerWidth + 32;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance(), ease: "none" }, 0);
        cards.forEach((card, i) => {
          tl.fromTo(
            card,
            { rotate: i % 2 ? 4 : -3, yPercent: i % 2 ? 8 : 4 },
            { rotate: 0, yPercent: 0, ease: "none", duration: 0.5 },
            Math.max(0, i * 0.22 - 0.2),
          );
        });
        tl.fromTo(".inc-progress__bar", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
        return () => el.classList.remove("is-scrubbed");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="inc t-cream" aria-labelledby="inc-title">
      <div className="inc-sticky">
        <header className="inc-head">
          <AnimatedHeading id="inc-title" className="display type-2" mode="words">
            les incontournables
          </AnimatedHeading>
          <p className="inc-head__note">La sélection Doka, à commander les yeux fermés.</p>
        </header>
        <div className="inc-viewport" tabIndex={0} aria-label="Les incontournables, faire défiler horizontalement">
          <ul className="inc-track">
            {items.map((p) => (
              <li key={p.slug} className="inc-card" data-tone={p.tone}>
                <div className="inc-card__visual">
                  <ProductVisual product={p} sizes="(max-width: 900px) 80vw, 34vw" />
                </div>
                <div className="inc-card__body">
                  <h3 className="inc-card__name display">
                    <DLink href={`/produits/${p.slug}`} className="inc-card__link">
                      {p.name.toLowerCase()}
                    </DLink>
                  </h3>
                  <p className="inc-card__short">{p.short}</p>
                  <p className="inc-card__price price">{formatPrice(p.price)}</p>
                  {p.mediaCaption && <p className="inc-card__caption">Photo : {p.mediaCaption.toLowerCase()}</p>}
                </div>
                <FavoriteButton slug={p.slug} className="inc-card__fav" />
              </li>
            ))}
            <li className="inc-card inc-card--end">
              <p className="display inc-end__title">et le reste de la carte.</p>
              <DLink href="/la-carte" className="inc-end__link">
                Voir la carte
              </DLink>
            </li>
          </ul>
        </div>
        <div className="inc-progress" aria-hidden="true">
          <span className="inc-progress__bar" />
        </div>
      </div>
    </section>
  );
}
