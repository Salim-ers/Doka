"use client";

import clsx from "clsx";
import { useRef } from "react";
import { DLink } from "@/components/ui/DLink";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { formatPrice, type Product } from "@/data/products";
import { sectionOf } from "@/data/categories";
import { ProductVisual } from "./ProductVisual";

type Props = {
  product: Product;
  variant?: "default" | "feature" | "compact";
  sizes?: string;
  className?: string;
  headingLevel?: "h2" | "h3";
};

/**
 * Carte produit en profondeur : perspective, inclinaison au survol (suivant le pointeur),
 * ombre qui s'allonge, photo qui s'approche. Toute la carte est cliquable (lien étiré)
 * et le cœur reste un bouton indépendant.
 */
export function ProductCard({ product, variant = "default", sizes, className, headingLevel = "h3" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const H = headingLevel;
  const cat = sectionOf(product);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <article
      ref={ref}
      className={clsx("pcard", `pcard--${variant}`, className)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      data-family={product.family}
    >
      <div className="pcard__inner">
        <div className="pcard__media">
          <ProductVisual
            product={product}
            sizes={sizes ?? (variant === "feature" ? "(max-width: 820px) 92vw, 50vw" : "(max-width: 820px) 92vw, 30vw")}
          />
        </div>
        <div className="pcard__body">
          <p className="pcard__tag">{product.signature ? "Signature" : cat.label}</p>
          <H className="pcard__name display">
            <DLink href={`/produits/${product.slug}`} className="pcard__link">
              {product.name}
            </DLink>
          </H>
          <p className="pcard__short">{product.short}</p>
          <p className="pcard__price price">{formatPrice(product.price)}</p>
        </div>
      </div>
      <FavoriteButton slug={product.slug} className="pcard__fav" />
    </article>
  );
}
