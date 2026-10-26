"use client";

import { useState, useSyncExternalStore } from "react";
import { MapPin } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { DokaLogo } from "@/components/brand/DokaLogo";

const KEY = "doka:maps-consent";

function readConsent() {
  try {
    return window.localStorage.getItem(KEY) === "granted";
  } catch {
    return false;
  }
}
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

/**
 * Carte Google Maps chargée uniquement après accord explicite (le fournisseur peut
 * déposer des traceurs). Le choix est mémorisé localement et révocable depuis la
 * page Confidentialité. Sans accord : une carte graphique et les liens directs.
 */
export function MapConsent() {
  const stored = useSyncExternalStore(subscribe, readConsent, () => false);
  const [accepted, setAccepted] = useState(false);
  const [remember, setRemember] = useState(false);
  const consent = stored || accepted;

  const accept = () => {
    setAccepted(true);
    if (remember) {
      try {
        window.localStorage.setItem(KEY, "granted");
      } catch {
        /* ignore */
      }
    }
  };

  if (consent) {
    return (
      <div className="map map--live">
        <iframe
          title={`Carte Google Maps : ${siteConfig.address.full}`}
          src={siteConfig.maps.embed}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  return (
    <div className="map map--placeholder">
      <div className="map__art" aria-hidden="true">
        <span className="map__street map__street--h">rue rambuteau</span>
        <span className="map__street map__street--v" />
        <span className="map__pin">
          <DokaLogo title={null} />
        </span>
      </div>
      <div className="map__consent">
        <p>
          <strong>Afficher la carte interactive ?</strong> Elle est fournie par Google Maps, qui peut déposer des
          cookies.
        </p>
        <label className="map__remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Retenir mon choix sur ce navigateur
        </label>
        <div className="map__actions">
          <button type="button" className="dbtn dbtn--ink" onClick={accept}>
            <span className="dbtn__label">Afficher la carte</span>
          </button>
          <a className="map__link" href={siteConfig.maps.place} target="_blank" rel="noopener noreferrer">
            <MapPin aria-hidden="true" size={16} strokeWidth={2.4} />
            Ouvrir dans Google Maps<span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export const MAPS_CONSENT_KEY = KEY;
