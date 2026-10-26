"use client";

import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { menuFilters, menuSections } from "@/data/categories";
import { bringYourOwnCup, drinkOptions, formatPrice, products } from "@/data/products";
import { DLink } from "@/components/ui/DLink";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { ProductVisual } from "@/components/products/ProductVisual";
import { MenuCategoryTabs } from "./MenuCategoryTabs";

const URL_EVENT = "doka:url";

type FilterId = (typeof menuFilters)[number]["id"];

function readFilter(): FilterId {
  const q = new URLSearchParams(window.location.search).get("categorie");
  return menuFilters.find((f) => f.id === q)?.id ?? "all";
}
function subscribeUrl(cb: () => void) {
  window.addEventListener(URL_EVENT, cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener(URL_EVENT, cb);
    window.removeEventListener("popstate", cb);
  };
}

/**
 * La carte : une rubrique par famille (cafés, matcha, autres boissons, gourmandises),
 * chaque ligne avec sa photo, son prix, son cœur et ses détails dépliables.
 * Filtres en onglets synchronisés avec l'URL (?categorie=). Au changement de filtre,
 * la liste reste dans le flux de la page (aucun élément sorti du flux, pas de saut) :
 * on ramène le haut de la carte à l'écran puis les lignes affichées apparaissent en cascade.
 */
export function MenuBoard() {
  const root = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  // Le filtre vit dans l'URL (?categorie=) : lien partageable, rechargement cohérent
  const filter = useSyncExternalStore(subscribeUrl, readFilter, () => "all" as FilterId);
  const [open, setOpen] = useState<string | null>(null);
  const changed = useRef(false);

  const change = useCallback(
    (id: string) => {
      if (id === filter) return;
      changed.current = true;
      setOpen(null);
      const url = new URL(window.location.href);
      if (id === "all") url.searchParams.delete("categorie");
      else url.searchParams.set("categorie", id);
      window.history.replaceState(window.history.state, "", url);
      window.dispatchEvent(new Event(URL_EVENT));
    },
    [filter],
  );

  // Après un changement de filtre : la carte revient en haut de l'écran, puis cascade
  useLayoutEffect(() => {
    if (!changed.current || !board.current) return;
    changed.current = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // en remontant, l'en-tête réapparaît : on garde la place de l'en-tête et des onglets
    const tabs = root.current?.querySelector<HTMLElement>(".mb-tabs");
    const header = document.querySelector<HTMLElement>(".site-header");
    const offset = (header?.offsetHeight ?? 0) + (tabs?.offsetHeight ?? 0) + 28;
    const top = board.current.getBoundingClientRect().top + window.scrollY - offset;
    if (window.scrollY > top) window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    if (reduce) return;
    const items = board.current.querySelectorAll(
      ".mb-section:not([hidden]) .mb-section__title, .mb-row:not([hidden]), .mb-options:not([hidden])",
    );
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "doka.out", overwrite: true },
    );
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
          stagger: 0.03,
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
  const sectionVisible = (id: string) => filter === "all" || filter === id;
  const count = products.filter((p) =>
    sectionVisible(menuSections.find((s) => s.family === p.family)?.id ?? ""),
  ).length;

  return (
    <div ref={root} className="mb">
      <div className="mb-tabs">
        <MenuCategoryTabs
          tabs={menuFilters}
          active={filter}
          onChange={change}
          label="Filtrer la carte"
          controls="carte-liste"
        />
      </div>

      <div ref={board} id="carte-liste" className="mb-board" role="tabpanel" aria-label={`Carte : ${active.label}`}>
        <p className="sr-only" aria-live="polite">
          {filter === "options" ? "Options et suppléments" : `${count} produits affichés`}
        </p>
        {menuSections.map((section) => {
          const items = products.filter((p) => p.family === section.family);
          return (
            <section
              key={section.id}
              className="mb-section"
              hidden={!sectionVisible(section.id)}
              aria-labelledby={`mb-${section.id}`}
            >
              <h2 id={`mb-${section.id}`} className="mb-section__title display">
                {section.title}
              </h2>
              <ul className="mb-list">
                {items.map((p) => {
                  const isOpen = open === p.slug;
                  return (
                    <li key={p.slug} className="mb-row" data-open={isOpen ? "" : undefined}>
                      <div className="mb-row__line">
                        <div className="mb-row__thumb" aria-hidden="true">
                          <ProductVisual product={p} sizes="80px" thumb />
                        </div>
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

        <section className="mb-options" hidden={!showOptions} aria-labelledby="mb-options">
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
