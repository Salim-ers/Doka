"use client";

import clsx from "clsx";
import { useRef } from "react";
import { Heart } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useFavorites } from "@/hooks/use-favorites";
import { productsBySlug } from "@/data/products";

type Props = { slug: string; className?: string; size?: "sm" | "md" | "lg"; withLabel?: boolean };

/**
 * Cœur favori : bascule, persiste localement, annonce l'état aux lecteurs d'écran.
 * À l'ajout, le cœur rebondit et projette quelques pastilles orange (les points du logo).
 */
export function FavoriteButton({ slug, className, size = "md", withLabel = false }: Props) {
  const { isFavorite, toggle } = useFavorites();
  const on = isFavorite(slug);
  const ref = useRef<HTMLButtonElement>(null);
  const name = productsBySlug[slug]?.name ?? slug;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggle(slug);
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const heart = el.querySelector("svg");
    gsap.fromTo(heart, { scale: added ? 0.5 : 1.2 }, { scale: 1, duration: 0.6, ease: "doka.pop" });
    if (added) {
      const dots = el.querySelectorAll(".fav-btn__dot");
      gsap.fromTo(
        dots,
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        {
          x: (i) => Math.cos((i / dots.length) * Math.PI * 2) * 22,
          y: (i) => Math.sin((i / dots.length) * Math.PI * 2) * 22,
          scale: 0,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
        },
      );
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={clsx("fav-btn", `fav-btn--${size}`, withLabel && "fav-btn--label", className)}
      aria-pressed={on}
      aria-label={withLabel ? undefined : on ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
      onClick={onClick}
      data-on={on ? "" : undefined}
    >
      <span className="fav-btn__burst" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <i key={i} className="fav-btn__dot" />
        ))}
      </span>
      <Heart aria-hidden="true" strokeWidth={2.4} fill={on ? "currentColor" : "none"} />
      {withLabel && <span>{on ? "Dans mes favoris" : "Ajouter aux favoris"}</span>}
    </button>
  );
}
