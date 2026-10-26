"use client";

import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { gsap, Flip, useGSAP } from "@/lib/gsap";
import { menuFilters, type MenuFilterId } from "@/data/categories";
import { bringYourOwnCup, drinkOptions, formatPrice, products, type Product } from "@/data/products";
import { DLink } from "@/components/ui/DLink";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { MenuCategoryTabs } from "./MenuCategoryTabs";

const URL_EVENT = "doka:url";

function readFilter(): MenuFilterId {
  const q = new URLSearchParams(window.location.search).get("categorie");
  return (menuFilters.find((f) => f.id === q)?.id ?? "all") as MenuFilterId;
}
function subscribeUrl(cb: () => void) {
  window.addEventListener(URL_EVENT, cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener(URL_EVENT, cb);
    window.removeEventListener("popstate", cb);
  };
}

const SECTIONS: { id: Product["boardSection"]; title: string }[] = [
  { id: "classics", title: "classics" },
  { id: "specials", title: "specials" },
  { id: "sweets", title: "sweets" },
];

/**
 * La carte, version tableau Doka : rubriques en minuscules grasses, lignes nom … prix.
 * Filtres en onglets (synchronisés avec l'URL ?categorie=), réorganisation animée
 * avec GSAP Flip (sans saut de mise en page), détails dépliables, favoris.
 */
export function MenuBoard() {
  const root = useRef<HTMLDivElement>(null);
  // Le filtre vit dans l'URL (?categorie=) : lien partageable, rechargement cohérent
  const filter = useSyncExternalStore(subscribeUrl, readFilter, () => "all" as MenuFilterId);
  const [open, setOpen] = useState<string | null>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const change = useCallback(
    (id: string) => {
      if (id === filter) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduce && root.current) {
        flipState.current = Flip.getState(root.current.querySelectorAll("[data-flip]"));
      }
      setOpen(null);
      const url = new URL(window.location.href);
      if (id === "all") url.searchParams.delete("categorie");
      else url.searchParams.set("categorie", id);
      window.history.replaceState(window.history.state, "", url);
      window.dispatchEvent(new Event(URL_EVENT));
    },
    [filter],
  );

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.6,
      ease: "doka.inOut",
      absolute: true,
      nested: true,
      prune: true,
      onEnter: (els) =>
        gsap.fromTo(els, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03, delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, y: -12, duration: 0.25 }),
    });
  }, [filter]);

  // Apparition initiale des lignes
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".mb-row, .mb-section__title, .mb-options", {
          y: 26,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.035,
          delay: 0.2,
          ease: "doka.out",
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const active = menuFilters.find((f) => f.id === filter) ?? menuFilters[0];
  const showOptions = filter === "all" || filter === "options";
  const visible = (p: Product) => filter !== "options" && active.match(p);
  const tabs = menuFilters.map((f) => ({
    id: f.id,
    label: f.label,
  }));

  return (
    <div ref={root} className="mb">
      <div className="mb-tabs">
        <MenuCategoryTabs
          tabs={tabs}
          active={filter}
          onChange={change}
          label="Filtrer la carte"
          controls="carte-liste"
        />
      </div>

      <div id="carte-liste" className="mb-board" role="tabpanel" aria-label={`Carte : ${active.label}`}>
        <p className="sr-only" aria-live="polite">
          {filter === "options" ? "Options et suppléments" : `${products.filter(visible).length} produits affichés`}
        </p>
        {SECTIONS.map((section) => {
          const items = products.filter((p) => p.boardSection === section.id);
          const any = items.some(visible);
          return (
            <section
              key={section.id}
              className="mb-section"
              data-flip
              data-flip-id={`s-${section.id}`}
              hidden={!any}
              aria-labelledby={`mb-${section.id}`}
            >
              <h2 id={`mb-${section.id}`} className="mb-section__title display">
                {section.title}
              </h2>
              <ul className="mb-list">
                {items.map((p) => {
                  const isOpen = open === p.slug;
                  return (
                    <li
                      key={p.slug}
                      className="mb-row"
                      data-flip
                      data-flip-id={p.slug}
                      hidden={!visible(p)}
                      data-open={isOpen ? "" : undefined}
                    >
                      <div className="mb-row__line">
                        <DLink href={`/produits/${p.slug}`} className="mb-row__name">
                          {p.name}
                          {p.signature && <span className="mb-badge">signature</span>}
                        </DLink>
                        <span className="mb-row__leader" aria-hidden="true" />
                        <span className="mb-row__price price">{formatPrice(p.price)}</span>
                        <FavoriteButton slug={p.slug} size="sm" className="mb-row__fav" />
                        <button
                          type="button"
                          className="mb-row__toggle"
                          aria-expanded={isOpen}
                          aria-controls={`mb-d-${p.slug}`}
                          onClick={() => setOpen(isOpen ? null : p.slug)}
                        >
                          <Plus aria-hidden="true" size={18} strokeWidth={2.6} />
                          <span className="sr-only">
                            {isOpen ? "Masquer" : "Afficher"} les détails : {p.name}
                          </span>
                        </button>
                      </div>
                      <div id={`mb-d-${p.slug}`} className="mb-row__details" hidden={!isOpen}>
                        <p>{p.description}</p>
                        {p.options.length > 0 && (
                          <p className="small">
                            Options :{" "}
                            {p.options.map((o) => drinkOptions.find((d) => d.id === o)?.label.toLowerCase()).join(", ")}
                            .
                          </p>
                        )}
                        <DLink href={`/produits/${p.slug}`} className="mb-row__more">
                          Voir la fiche {p.name}
                        </DLink>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <section
          className="mb-options"
          data-flip
          data-flip-id="options"
          hidden={!showOptions}
          aria-labelledby="mb-options"
        >
          <h2 id="mb-options" className="mb-section__title display">
            options
          </h2>
          <div className="mb-options__grid">
            <div className="mb-options__col">
              <h3 className="mb-options__h">Sans supplément</h3>
              <ul className="mb-list">
                {drinkOptions
                  .filter((o) => o.price === 0)
                  .map((o) => (
                    <li key={o.id} className="mb-row mb-row--static">
                      <div className="mb-row__line">
                        <span className="mb-row__name">{o.label}</span>
                        <span className="mb-row__leader" aria-hidden="true" />
                        <span className="mb-row__price price">{formatPrice(o.price, { signed: true })}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="mb-options__col">
              <h3 className="mb-options__h">Suppléments</h3>
              <ul className="mb-list">
                {drinkOptions
                  .filter((o) => o.price > 0)
                  .map((o) => (
                    <li key={o.id} className="mb-row mb-row--static">
                      <div className="mb-row__line">
                        <span className="mb-row__name">{o.label}</span>
                        <span className="mb-row__leader" aria-hidden="true" />
                        <span className="mb-row__price price">{formatPrice(o.price, { signed: true })}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <p className="mb-byoc">
            <span className="mb-byoc__stamp price">{formatPrice(-bringYourOwnCup.discount)}</span>
            <span>
              <strong>{bringYourOwnCup.label}.</strong> Ton propre gobelet, et ta boisson coûte{" "}
              {formatPrice(bringYourOwnCup.discount)} de moins.
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}
