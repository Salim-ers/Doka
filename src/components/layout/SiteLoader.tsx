import { DokaLogo } from "@/components/brand/DokaLogo";
import { siteConfig } from "@/data/site-config";

/**
 * Écran de chargement du site (≈ 2 s, à chaque chargement complet d'une page) :
 * nappe orange, lettres du logo posées une à une, compteur et jauge qui se remplissent,
 * puis la nappe se lève en s'arrondissant et révèle la page.
 * 100 % CSS : joué avant même l'hydratation, jamais bloquant (pointer-events: none),
 * absent en mouvement réduit. Les navigations internes utilisent la transition de page.
 */
export function SiteLoader() {
  return (
    <div className="loader" aria-hidden="true">
      <div className="loader__inner">
        <div className="loader__logo">
          <DokaLogo title={null} />
        </div>
        <p className="loader__tagline">{siteConfig.tagline.toLowerCase()}</p>
        <div className="loader__progress">
          <span className="loader__bar">
            <span />
          </span>
          <span className="loader__count" />
        </div>
      </div>
    </div>
  );
}
