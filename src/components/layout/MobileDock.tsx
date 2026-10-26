"use client";

import { usePathname } from "next/navigation";
import { Coffee, Navigation } from "lucide-react";
import { DLink } from "@/components/ui/DLink";
import { siteConfig } from "@/data/site-config";

/**
 * Barre d'accès rapide, en bas de l'écran sur mobile et tablette (là où l'en-tête
 * n'affiche que le bouton Menu) : la carte et l'itinéraire, à portée de pouce.
 */
export function MobileDock() {
  const pathname = usePathname();
  return (
    <nav className="dock" aria-label="Accès rapide">
      <DLink
        href="/la-carte"
        className="dock__btn dock__btn--carte"
        aria-current={pathname === "/la-carte" ? "page" : undefined}
      >
        <Coffee aria-hidden="true" size={19} strokeWidth={2.4} />
        La carte
      </DLink>
      <a
        className="dock__btn dock__btn--route"
        href={siteConfig.maps.directions}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Navigation aria-hidden="true" size={18} strokeWidth={2.4} />
        Itinéraire<span className="sr-only"> (Google Maps, nouvel onglet)</span>
      </a>
    </nav>
  );
}
