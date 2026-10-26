"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { MAPS_CONSENT_KEY } from "./MapConsent";

/** Boutons d'effacement des données locales : favoris et accord carte. */
export function PrivacyControls() {
  const { count, clear } = useFavorites();
  const [msg, setMsg] = useState("");

  return (
    <div className="privacy-controls">
      <button
        type="button"
        className="dbtn dbtn--ink"
        onClick={() => (clear(), setMsg("Favoris effacés."))}
        disabled={count === 0}
      >
        <span className="dbtn__label">Effacer mes favoris ({count})</span>
      </button>
      <button
        type="button"
        className="dbtn dbtn--outline"
        onClick={() => {
          try {
            window.localStorage.removeItem(MAPS_CONSENT_KEY);
          } catch {
            /* ignore */
          }
          setMsg("Accord pour la carte retiré.");
        }}
      >
        <span className="dbtn__label">Retirer mon accord pour la carte</span>
      </button>
      <p className="small" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}
