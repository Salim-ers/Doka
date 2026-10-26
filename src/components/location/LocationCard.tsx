"use client";

import { useRef, useState } from "react";
import { Copy, Check, MapPin, Navigation } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatHour, siteConfig } from "@/data/site-config";
import { DokaButton } from "@/components/ui/DokaButton";
import { InstagramGlyph } from "@/components/ui/icons";
import { OpenStatus, useParisDay } from "./OpenStatus";

/**
 * Bloc pratique de « Nous trouver » : adresse (copiable), itinéraire, horaires
 * (jour courant mis en avant), accès, carte Google Maps interactive.
 */
export function LocationCard() {
  const root = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const today = useParisDay();
  const { address, maps, instagram, hours, access } = siteConfig;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".loc-card", {
          y: 60,
          autoAlpha: 0,
          rotate: (i: number) => [-2, 1.5, -1][i] ?? 0,
          stagger: 0.1,
          duration: 1,
          ease: "doka.out",
          delay: 0.3,
        });
        gsap.fromTo(
          ".map",
          { clipPath: "circle(4% at 50% 50%)" },
          {
            clipPath: "circle(80% at 50% 50%)",
            duration: 1.4,
            ease: "doka.inOut",
            scrollTrigger: { trigger: ".map", start: "top 85%", once: true },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Doka Coffee Shop, ${address.full}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div ref={root} className="loc">
      <div className="loc-grid">
        <section className="loc-card t-orange" aria-labelledby="loc-adresse">
          <h2 id="loc-adresse" className="loc-card__h">
            Adresse
          </h2>
          <address className="loc-address">
            Doka Coffee Shop
            <br />
            {address.street}
            <br />
            {address.postalCode} {address.city}
          </address>
          <OpenStatus />
          <div className="loc-actions">
            <DokaButton href={maps.directions} external variant="ink" icon={<Navigation size={18} strokeWidth={2.4} />}>
              Itinéraire
            </DokaButton>
            <button type="button" className="loc-copy" onClick={copy}>
              {copied ? (
                <Check aria-hidden="true" size={18} strokeWidth={2.6} />
              ) : (
                <Copy aria-hidden="true" size={18} strokeWidth={2.4} />
              )}
              {copied ? "Adresse copiée" : "Copier l'adresse"}
            </button>
            <span className="sr-only" aria-live="polite">
              {copied ? "Adresse copiée dans le presse-papiers" : ""}
            </span>
          </div>
          <div className="loc-links">
            <a href={maps.place} target="_blank" rel="noopener noreferrer">
              <MapPin aria-hidden="true" size={16} strokeWidth={2.4} /> Voir sur Google Maps
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
            <a href={instagram.url} target="_blank" rel="noopener noreferrer">
              <InstagramGlyph size={16} /> {instagram.handle}
              <span className="sr-only"> sur Instagram (nouvel onglet)</span>
            </a>
          </div>
        </section>

        {hours.show && (
          <section className="loc-card t-paper" aria-labelledby="loc-horaires">
            <h2 id="loc-horaires" className="loc-card__h">
              Horaires
            </h2>
            <table className="loc-hours">
              <caption className="sr-only">Horaires d&apos;ouverture</caption>
              <tbody>
                {hours.days.map((d, i) => (
                  <tr
                    key={d.day}
                    data-today={today === i ? "" : undefined}
                    aria-current={today === i ? "date" : undefined}
                  >
                    <th scope="row">{d.day}</th>
                    <td>
                      {formatHour(d.open)} – {formatHour(d.close)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="small muted">Horaires indicatifs, susceptibles d&apos;évoluer les jours fériés.</p>
          </section>
        )}

        <section className="loc-card t-ink" aria-labelledby="loc-acces">
          <h2 id="loc-acces" className="loc-card__h">
            Accès
          </h2>
          <ul className="loc-access">
            {access.lines.map((l) => (
              <li key={l.name}>
                <strong>{l.name}</strong>
                <span>{l.detail}</span>
              </li>
            ))}
          </ul>
          <p className="small">Commande et retrait au guichet, sur le trottoir.</p>
        </section>
      </div>

      <div className="map">
        <iframe
          title={`Carte Google Maps : Doka Coffee Shop, ${address.full}`}
          src={maps.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
