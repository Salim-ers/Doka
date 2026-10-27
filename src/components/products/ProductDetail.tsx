"use client";

import { useRef } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { bringYourOwnCup, drinkOptions, formatPrice, productsBySlug, type Product } from "@/data/products";
import { sectionOf } from "@/data/categories";
import { siteConfig } from "@/data/site-config";
import { media } from "@/data/media";
import { DLink } from "@/components/ui/DLink";
import { DokaButton } from "@/components/ui/DokaButton";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { AnimatedPrice } from "@/components/ui/AnimatedPrice";
import { ProductVisual } from "./ProductVisual";
import { ProductCard } from "./ProductCard";

/**
 * Fiche produit. Ouverture : le visuel s'ouvre depuis une pastille (comme une carte
 * qu'on déplie), le nom tombe lettre par lettre, le prix compte jusqu'à sa valeur.
 * Uniquement des informations connues (catalogue central).
 */
export function ProductDetail({ product }: { product: Product }) {
  const root = useRef<HTMLElement>(null);
  const cat = sectionOf(product);
  const options = drinkOptions.filter((o) => product.options.includes(o.id));
  const suggestions = product.pairsWith
    .map((s) => productsBySlug[s])
    .filter(Boolean)
    .slice(0, 3);
  const isDrink = product.family !== "sweet";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const name = root.current?.querySelector(".pd-name");
        const split = name
          ? SplitText.create(name, { type: "chars,words", mask: "words", wordsClass: "split-word", aria: "auto" })
          : null;
        root.current?.querySelectorAll("[data-reveal='hero']").forEach((n) => n.removeAttribute("data-reveal"));
        gsap
          .timeline({ delay: 0.1 })
          .fromTo(
            ".pd-visual",
            { clipPath: "circle(8% at 50% 50%)", scale: 0.92 },
            { clipPath: "circle(80% at 50% 50%)", scale: 1, duration: 1.3, ease: "doka.inOut" },
            0,
          )
          .from(split?.chars ?? [], { yPercent: 115, rotate: 6, duration: 0.9, stagger: 0.025, ease: "doka.pop" }, 0.25)
          .from(".pd-meta > *, .pd-body > *", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, 0.45);
        gsap.from(".pd-suggest .pcard", {
          y: 50,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.9,
          scrollTrigger: { trigger: ".pd-suggest", start: "top 92%", once: true },
        });
        return () => split?.revert();
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.current?.querySelectorAll("[data-reveal='hero']").forEach((n) => n.removeAttribute("data-reveal"));
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <article ref={root} className="pd t-cream" data-family={product.family}>
      <div className="pd-top">
        <div className="pd-visual-wrap">
          <div className="pd-visual" data-reveal="hero">
            <ProductVisual product={product} sizes="(max-width: 900px) 100vw, 55vw" priority />
          </div>
          {product.mediaCaption ? (
            <p className="small muted pd-caption">Photo : {product.mediaCaption.toLowerCase()}.</p>
          ) : product.media && media[product.media].credit ? (
            <p className="small muted pd-caption">Photo d&apos;illustration, libre de droits.</p>
          ) : (
            <p className="small muted pd-caption">Illustration : la boisson vue de dessus. Photo à venir.</p>
          )}
        </div>

        <div className="pd-info">
          <nav className="pd-crumbs" aria-label="Fil d'Ariane">
            <ol>
              <li>
                <DLink href="/la-carte">La carte</DLink>
              </li>
              <li>
                <DLink href={`/la-carte?categorie=${cat.id}`}>{cat.label}</DLink>
              </li>
              <li aria-current="page">{product.name}</li>
            </ol>
          </nav>
          <h1 className="pd-name display" data-reveal="hero">
            {product.name.toLowerCase()}
          </h1>
          <div className="pd-meta">
            <AnimatedPrice cents={product.price} className="pd-price" trigger=".pd" />
            {product.signature && <span className="pd-tag">Signature</span>}
            <span className="pd-tag pd-tag--soft">{cat.label}</span>
          </div>
          <div className="pd-body">
            <p className="lead">{product.description}</p>
            {isDrink && (
              <div className="pd-options">
                <h2 className="pd-h">Options de la carte</h2>
                {options.length > 0 ? (
                  <ul className="pd-options__list">
                    {options.map((o) => (
                      <li key={o.id}>
                        <span>{o.label}</span>
                        <span className="price">
                          {o.price === 0 ? "sans supplément" : formatPrice(o.price, { signed: true })}
                        </span>
                      </li>
                    ))}
                    <li>
                      <span>{bringYourOwnCup.label}</span>
                      <span className="price">{formatPrice(-bringYourOwnCup.discount)}</span>
                    </li>
                  </ul>
                ) : (
                  <p>Pas d&apos;option particulière pour cette boisson.</p>
                )}
                <p className="small muted">Selon la boisson, à préciser au guichet.</p>
              </div>
            )}
            <div className="pd-actions">
              <FavoriteButton slug={product.slug} withLabel />
              <DokaButton href="/la-carte" variant="ink" icon={<ArrowLeft size={18} strokeWidth={2.4} />}>
                Retour à la carte
              </DokaButton>
              <DokaButton
                href={siteConfig.maps.directions}
                external
                variant="outline"
                icon={<MapPin size={18} strokeWidth={2.4} />}
              >
                Venir le chercher
              </DokaButton>
            </div>
            <p className="small muted">À emporter uniquement, au {siteConfig.address.full}.</p>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <section className="pd-suggest" aria-labelledby="pd-suggest-title">
          <h2 id="pd-suggest-title" className="display type-3">
            ça va bien avec
          </h2>
          <div className="pd-suggest__grid">
            {suggestions.map((p) => (
              <ProductCard key={p.slug} product={p} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
