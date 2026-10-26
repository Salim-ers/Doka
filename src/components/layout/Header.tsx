"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { DLink } from "@/components/ui/DLink";
import { DokaLogo } from "@/components/brand/DokaLogo";
import { mainNav } from "@/data/site-config";
import { useFavorites } from "@/hooks/use-favorites";
import { FullscreenMenu } from "./FullscreenMenu";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Header() {
  const pathname = usePathname();
  const { count } = useFavorites();
  // L'en-tête masqué l'est pour une page donnée : il réapparaît à chaque navigation
  const [hiddenOn, setHiddenOn] = useState<string | null>(null);
  const hidden = hiddenOn === pathname;
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLUListElement>(null);
  const blobRef = useRef<HTMLLIElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Masqué en descendant, réaffiché en remontant ; plus compact après le haut de page
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setCompact(y > 24);
        if (y > 280 && y > last + 2) setHiddenOn(window.location.pathname);
        else if (y < last - 2 || y <= 280) setHiddenOn(null);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pastille orange : se place sous la page active, suit le survol
  const moveBlob = useCallback((el: HTMLElement | null | undefined, instant = false) => {
    const blob = blobRef.current;
    const list = navRef.current;
    if (!blob || !list) return;
    if (!el) {
      blob.style.opacity = "0";
      return;
    }
    const a = el.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    blob.style.transition = instant ? "none" : "";
    blob.style.opacity = "1";
    blob.style.transform = `translateX(${a.left - b.left}px)`;
    blob.style.width = `${a.width}px`;
  }, []);
  const resetBlob = useCallback(
    (instant = false) => {
      const active = navRef.current?.querySelector<HTMLElement>("[aria-current='page']");
      moveBlob(active, instant);
    },
    [moveBlob],
  );
  useEffect(() => {
    resetBlob(true);
    const onResize = () => resetBlob(true);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => resetBlob(true));
    return () => window.removeEventListener("resize", onResize);
  }, [pathname, resetBlob]);

  return (
    <>
      <header
        className="site-header"
        data-hidden={hidden && !menuOpen ? "" : undefined}
        data-compact={compact ? "" : undefined}
      >
        <DLink href="/" className="site-header__logo" aria-label="Doka, retour à l'accueil">
          <DokaLogo title={null} />
        </DLink>

        <nav className="site-nav" aria-label="Navigation principale">
          <ul ref={navRef} onMouseLeave={() => resetBlob()}>
            <li ref={blobRef} className="site-nav__blob" aria-hidden="true" role="presentation" />
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <DLink
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={(e) => moveBlob(e.currentTarget)}
                    onFocus={(e) => moveBlob(e.currentTarget)}
                    onBlur={() => resetBlob()}
                  >
                    {item.label}
                  </DLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <DLink href="/nos-favoris" className="fav-pill" aria-label={`Mes favoris : ${count}`}>
            <Heart aria-hidden="true" size={18} strokeWidth={2.4} fill={count ? "currentColor" : "none"} />
            <span className="fav-pill__count" key={count}>
              {count}
            </span>
          </DLink>
          <DLink href="/la-carte" className="header-cta">
            La carte
          </DLink>
          <button
            ref={menuBtn}
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="menu-plein-ecran"
            onClick={() => setMenuOpen(true)}
          >
            <span className="menu-toggle__dots" aria-hidden="true">
              <i />
              <i />
            </span>
            Menu
          </button>
        </div>
      </header>
      <FullscreenMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          // après le rendu : l'en-tête n'est plus inerte, le focus peut y revenir
          requestAnimationFrame(() => requestAnimationFrame(() => menuBtn.current?.focus()));
        }}
        pathname={pathname}
      />
    </>
  );
}
