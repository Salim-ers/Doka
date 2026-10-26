"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

type Tab = { id: string; label: string; count?: number };

type Props = {
  tabs: readonly Tab[];
  active: string;
  onChange: (id: string) => void;
  label: string;
  controls?: string;
};

/**
 * Onglets de filtre en pastilles. Une pastille noire glisse sous l'onglet actif.
 * Clavier : flèches gauche/droite, Début/Fin (motif « tabs » ARIA).
 */
export function MenuCategoryTabs({ tabs, active, onChange, label, controls }: Props) {
  const list = useRef<HTMLDivElement>(null);
  const blob = useRef<HTMLSpanElement>(null);

  const place = (instant = false) => {
    const el = list.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    const b = blob.current;
    if (!el || !b) return;
    b.style.transition = instant ? "none" : "";
    b.style.width = `${el.offsetWidth}px`;
    b.style.transform = `translateX(${el.offsetLeft}px)`;
    // garder l'onglet actif visible sur mobile
    const l = list.current;
    if (l && !instant) {
      const target = el.offsetLeft - (l.clientWidth - el.offsetWidth) / 2;
      l.scrollTo({ left: target, behavior: "smooth" });
    }
  };

  useLayoutEffect(() => {
    place(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    place(true);
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => place(true));
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(tabs[next].id);
    list.current?.querySelector<HTMLElement>(`[data-tab="${tabs[next].id}"]`)?.focus();
  };

  return (
    <div ref={list} className="chips" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      <span ref={blob} className="chips__blob" aria-hidden="true" />
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          data-tab={t.id}
          className="chip"
          aria-selected={t.id === active}
          aria-controls={controls}
          tabIndex={t.id === active ? 0 : -1}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {typeof t.count === "number" && <span className="chip__count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
