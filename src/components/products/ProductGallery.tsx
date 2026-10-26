"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { productCategories, productsIn } from "@/data/categories";
import { formatPrice } from "@/data/products";
import { ProductCard } from "./ProductCard";

/**
 * Galerie « Nos produits » : une section par famille, composition asymétrique
 * (le produit photographié de chaque famille est mis en avant en grand).
 * La barre de catégories suit le défilement (scroll-spy) et y ramène au clic.
 */
/** « De 1,50 € à 4,00 €. » calculé depuis le catalogue (rien si aucun prix connu). */
function priceSpan(items: { price: number | null }[]) {
  const prices = items.map((p) => p.price).filter((p): p is number => p !== null);
  if (!prices.length) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `${formatPrice(min)}.` : `De ${formatPrice(min)} à ${formatPrice(max)}.`;
}

export function ProductGallery() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(productCategories[0].id);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".pg-grid", root.current).forEach((grid) => {
          gsap.from(grid.querySelectorAll(".pcard"), {
            y: 70,
            rotateX: 14,
            autoAlpha: 0,
            transformPerspective: 900,
            transformOrigin: "50% 100%",
            duration: 1,
            stagger: 0.08,
            ease: "doka.out",
            scrollTrigger: { trigger: grid, start: "top 85%", once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>(".pg-section__title", root.current).forEach((t) => {
          gsap.from(t, {
            xPercent: -8,
            autoAlpha: 0,
            duration: 1,
            scrollTrigger: { trigger: t, start: "top 88%", once: true },
          });
        });
      });
      // scroll-spy
      const triggers = gsap.utils.toArray<HTMLElement>(".pg-section", root.current).map((sec) =>
        ScrollTrigger.create({
          trigger: sec,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setActive(sec.dataset.cat ?? ""),
        }),
      );
      return () => {
        mm.revert();
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: root },
  );

  // ancre initiale (ex. /produits#sweet depuis l'accueil)
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) window.setTimeout(() => el.scrollIntoView({ behavior: "auto", block: "start" }), 450);
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.replaceState(window.history.state, "", `#${id}`);
    setActive(id);
  };

  return (
    <div ref={root} className="pg">
      <nav className="pg-nav" aria-label="Catégories de produits">
        <ul className="chips">
          {productCategories.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                className="chip"
                aria-current={active === c.id ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  go(c.id);
                }}
              >
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {productCategories.map((c) => {
        const items = productsIn(c.id);
        const featured = items.find((p) => p.media) ?? (items.length === 1 ? items[0] : undefined);
        return (
          <section key={c.id} id={c.id} data-cat={c.id} className="pg-section" aria-labelledby={`pg-${c.id}`}>
            <header className="pg-section__head">
              <h2 id={`pg-${c.id}`} className="pg-section__title display">
                {c.label.toLowerCase()}
              </h2>
              <p className="pg-section__intro">
                {c.intro} {priceSpan(items)}{" "}
                <span className="muted">
                  {items.length} produit{items.length > 1 ? "s" : ""}
                </span>
              </p>
            </header>
            <div className={clsx("pg-grid", items.length === 1 && "pg-grid--single")}>
              {featured && <ProductCard product={featured} variant="feature" className="pg-feature" />}
              {items
                .filter((p) => p !== featured)
                .map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
