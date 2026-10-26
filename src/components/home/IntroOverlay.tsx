import { DokaLogo } from "@/components/brand/DokaLogo";

/**
 * Intro très courte (≈ 1 s) : nappe orange, logo crème qui monte de sa ligne de base,
 * puis la nappe s'ouvre vers le haut. 100 % CSS, donc jouée avant même l'hydratation,
 * jamais bloquante (pointer-events: none) et absente en mouvement réduit.
 * Jouée une fois par session : le script marque <html> pour les visites suivantes.
 */
export function IntroOverlay() {
  return (
    <div className="intro" aria-hidden="true">
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{if(sessionStorage.getItem('doka:intro')){document.documentElement.classList.add('intro-seen')}else{sessionStorage.setItem('doka:intro','1')}}catch(e){}",
        }}
      />
      <div className="intro__logo">
        <DokaLogo title={null} />
      </div>
    </div>
  );
}
