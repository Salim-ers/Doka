"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";

/** Bouton d'effacement des données locales : les favoris. */
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
      <p className="small" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}
