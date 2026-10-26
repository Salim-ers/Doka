"use client";

import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { DLink } from "@/components/ui/DLink";
import { DokaLogo } from "@/components/brand/DokaLogo";
import { legalNav, mainNav, siteConfig } from "@/data/site-config";

/**
 * Footer signature : la conclusion graphique du parcours.
 * Les quatre lettres du logo montent une à une depuis la ligne de base,
 * comme des gobelets posés sur le comptoir.
 */
export function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const letters = root.current?.querySelectorAll(".footer-logo [data-letter]");
        if (!letters?.length) return;
        gsap.fromTo(
          letters,
          { yPercent: 105, rotate: (i) => [-6, 4, -3, 6][i] ?? 0, transformOrigin: "50% 100%" },
          {
            yPercent: 0,
            rotate: 0,
            ease: "doka.pop",
            duration: 1,
            stagger: 0.08,
            scrollTrigger: { trigger: ".footer-logo", start: "top 92%", toggleActions: "play none none reverse" },
          },
        );
        gsap.fromTo(
          ".footer-cols > *",
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.08,
            duration: 0.7,
            scrollTrigger: { trigger: ".footer-cols", start: "top 90%" },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const year = 2026;

  return (
    <footer ref={root} className="site-footer t-orange" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        Doka Coffee Shop, informations pratiques
      </h2>
      <div className="footer-top">
        <p className="footer-sign display">
          fait pour
          <br />
          tous les jours.
        </p>
        <p className="footer-promise brandline">
          Du café de spécialité, pour tout le monde. Chaud ou glacé, du matin au soir.
        </p>
      </div>

      <div className="footer-cols">
        <div>
          <h3 className="footer-h">Adresse</h3>
          <address>
            {siteConfig.address.street}
            <br />
            {siteConfig.address.postalCode} {siteConfig.address.city}
          </address>
          <p className="footer-note">100 % à emporter, au guichet.</p>
          <a className="footer-link" href={siteConfig.maps.directions} target="_blank" rel="noopener noreferrer">
            Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
          </a>
        </div>
        {siteConfig.hours.show && (
          <div>
            <h3 className="footer-h">Horaires</h3>
            <dl className="footer-hours">
              {siteConfig.hours.summary.map((h) => (
                <div key={h.label}>
                  <dt>{h.label}</dt>
                  <dd>{h.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <nav aria-label="Pied de page">
          <h3 className="footer-h">Explorer</h3>
          <ul className="footer-nav">
            {mainNav.map((n) => (
              <li key={n.href}>
                <DLink href={n.href}>{n.label}</DLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-follow">
          <h3 className="footer-h">Suivre</h3>
          <a className="footer-link" href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer">
            Instagram {siteConfig.instagram.handle}
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
          <button
            type="button"
            className="footer-top-btn"
            onClick={() => {
              const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
              ScrollTrigger.refresh();
            }}
          >
            <ArrowUp aria-hidden="true" size={18} strokeWidth={2.4} />
            Retour en haut
          </button>
        </div>
      </div>

      <div className="footer-logo" aria-hidden="true">
        <DokaLogo title={null} />
      </div>

      <div className="footer-legal">
        <p>© {year} Doka Coffee Shop</p>
        <ul>
          {legalNav.map((n) => (
            <li key={n.href}>
              <DLink href={n.href}>{n.label}</DLink>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
