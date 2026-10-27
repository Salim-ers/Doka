"use client";

import { useRef } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useFavorites } from "@/hooks/use-favorites";
import { formatPrice, productsBySlug } from "@/data/products";
import { DLink } from "@/components/ui/DLink";
import { DokaButton } from "@/components/ui/DokaButton";
import { ProductVisual } from "@/components/products/ProductVisual";

/**
 * Les favoris du visiteur, enregistrés dans ce navigateur (localStorage) :
 * liste, compteur, suppression unitaire ou totale, état vide illustré.
 * Rendu côté client uniquement (rien n'est stocké sur un serveur).
 */
export function FavoritesBoard() {
  const { favorites, count, remove, clear } = useFavorites();
  const ready = useHydrated();
  const list = useRef<HTMLUListElement>(null);

  const removeAnimated = (slug: string) => {
    const el = list.current?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce) return remove(slug);
    gsap.to(el, { autoAlpha: 0, scale: 0.9, duration: 0.3, ease: "power2.in", onComplete: () => remove(slug) });
  };

  if (!ready) {
    return <p className="fav-empty__text">Chargement de tes favoris…</p>;
  }

  return (
    <div className="favs">
      <div className="favs-head">
        <p className="favs-count" aria-live="polite">
          <span className="favs-count__n display">{count}</span>
          <span>{count > 1 ? "favoris enregistrés" : count === 1 ? "favori enregistré" : "favori pour l'instant"}</span>
        </p>
        {count > 0 && (
          <button type="button" className="favs-clear" onClick={clear}>
            Tout retirer
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className="fav-empty">
          <span className="fav-empty__cup" aria-hidden="true">
            <svg viewBox="0 0 200 240">
              <path
                d="M40 60h120l-14 160a12 12 0 0 1-12 11H66a12 12 0 0 1-12-11z"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinejoin="round"
              />
              <rect x="28" y="38" width="144" height="26" rx="13" fill="none" stroke="currentColor" strokeWidth="8" />
            </svg>
            {/* point superposé, animé par la carte graphique */}
            <svg className="fav-empty__dot" viewBox="0 0 200 240">
              <circle cx="100" cy="140" r="16" fill="var(--orange)" />
            </svg>
          </span>
          <p className="fav-empty__title display">rien ici, pour l&apos;instant.</p>
          <p className="fav-empty__text">
            Touche le cœur d&apos;une boisson sur la carte ou sur sa fiche : elle t&apos;attendra ici, sur ce
            navigateur.
          </p>
          <DokaButton href="/la-carte" variant="orange">
            Parcourir la carte
          </DokaButton>
        </div>
      ) : (
        <ul ref={list} className="favs-list">
          {favorites.map((slug) => {
            const p = productsBySlug[slug];
            if (!p) return null;
            return (
              <li key={slug} data-slug={slug} className="favs-item">
                <div className="favs-item__visual">
                  <ProductVisual product={p} sizes="120px" thumb />
                </div>
                <div className="favs-item__body">
                  <DLink href={`/produits/${p.slug}`} className="favs-item__name">
                    {p.name}
                  </DLink>
                  <span className="price">{formatPrice(p.price)}</span>
                </div>
                <button type="button" className="favs-item__remove" onClick={() => removeAnimated(slug)}>
                  <X aria-hidden="true" size={18} strokeWidth={2.4} />
                  <span className="sr-only">Retirer {p.name} des favoris</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="small muted favs-note">
        Tes favoris sont enregistrés uniquement dans ce navigateur. Aucun compte, aucune donnée envoyée.
      </p>
    </div>
  );
}
