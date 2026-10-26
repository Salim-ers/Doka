"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatPrice, productsBySlug, signatureSelection } from "@/data/products";
import { DLink } from "@/components/ui/DLink";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProductVisual } from "@/components/products/ProductVisual";

/**
 * La sélection Doka : quatre affiches en quinconce, chacune avec sa propre entrée
 * (le café coule, le lait tourne, le matcha s'ouvre, le nuage gonfle).
 */
const ENTRANCES = ["pour", "swirl", "open", "puff"] as const;

export function EditorialSelection() {
  const root = useRef<HTMLDivElement>(null);
  const items = signatureSelection.map((s) => productsBySlug[s]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".sel-item", root.current).forEach((item) => {
          const kind = item.dataset.entrance;
          const visual = item.querySelector(".sel-item__visual");
          const st = { trigger: item, start: "top 78%", once: true };
          const tl = gsap.timeline({ scrollTrigger: st });
          if (kind === "pour") {
            tl.fromTo(
              visual,
              { clipPath: "inset(0 0 100% 0 round 2.2rem)" },
              { clipPath: "inset(0 0 0% 0 round 2.2rem)", duration: 1.2, ease: "doka.inOut" },
            );
          } else if (kind === "swirl") {
            tl.fromTo(
              visual,
              { clipPath: "circle(0% at 50% 50%)", rotate: -6 },
              { clipPath: "circle(80% at 50% 50%)", rotate: 0, duration: 1.3, ease: "doka.inOut" },
            );
          } else if (kind === "open") {
            tl.fromTo(
              visual,
              { clipPath: "inset(0 50% 0 50% round 2.2rem)" },
              { clipPath: "inset(0 0% 0 0% round 2.2rem)", duration: 1.2, ease: "doka.inOut" },
            );
          } else {
            tl.fromTo(
              visual,
              { scale: 0.6, autoAlpha: 0, borderRadius: "50%" },
              { scale: 1, autoAlpha: 1, borderRadius: "2.2rem", duration: 1.2, ease: "doka.pop" },
            );
          }
          tl.from(
            item.querySelectorAll(".sel-item__body > *"),
            { y: 34, autoAlpha: 0, stagger: 0.08, duration: 0.8 },
            0.3,
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="sel">
      {items.map((p, i) => (
        <article key={p.slug} className="sel-item" data-entrance={ENTRANCES[i % ENTRANCES.length]} data-tone={p.tone}>
          <div className="sel-item__visual">
            <ProductVisual product={p} sizes="(max-width: 900px) 92vw, 55vw" />
          </div>
          <div className="sel-item__body">
            <h3 className="sel-item__name display">{p.name.toLowerCase()}</h3>
            <p className="sel-item__price price">{formatPrice(p.price)}</p>
            <p className="sel-item__text">{p.description}</p>
            {p.mediaCaption && <p className="small muted">Photo : {p.mediaCaption.toLowerCase()}.</p>}
            <div className="sel-item__actions">
              <DLink href={`/produits/${p.slug}`} className="sel-item__link">
                Voir la fiche {p.name}
              </DLink>
              <FavoriteButton slug={p.slug} withLabel />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
