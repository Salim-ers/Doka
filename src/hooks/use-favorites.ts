"use client";

import { useCallback, useSyncExternalStore } from "react";
import { productsBySlug } from "@/data/products";

/**
 * Favoris du visiteur, stockés localement (localStorage), sans compte ni serveur.
 * Synchronisés entre composants (événement interne) et entre onglets (événement storage).
 */
const KEY = "doka:favorites:v1";
const EVENT = "doka:favorites";
const EMPTY: string[] = [];
let cache: string[] | null = null;
let cacheRaw: string | null = null;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cacheRaw && cache) return cache;
    cacheRaw = raw;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string" && s in productsBySlug)
      : [];
    return cache;
  } catch {
    return cache ?? EMPTY;
  }
}

function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // stockage indisponible (navigation privée stricte) : on garde l'état en mémoire
    cache = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, read, () => EMPTY);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);
  const toggle = useCallback((slug: string) => {
    const cur = read();
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    write(next);
    return next.includes(slug);
  }, []);
  const remove = useCallback((slug: string) => write(read().filter((s) => s !== slug)), []);
  const clear = useCallback(() => write([]), []);

  return { favorites, count: favorites.length, isFavorite, toggle, remove, clear };
}
