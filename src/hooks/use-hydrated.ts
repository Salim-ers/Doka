"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** `false` pendant le rendu serveur et l'hydratation, `true` ensuite. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
