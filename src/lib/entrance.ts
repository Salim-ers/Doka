/**
 * Délai des animations de début de page. Au premier affichage, l'écran de chargement
 * couvre la page ; lors d'une navigation, c'est la nappe de transition. Les titres et le
 * hero attendent qu'ils commencent à s'ouvrir, pour s'animer sous les yeux du visiteur
 * plutôt que derrière.
 */

/** Durée (s), environ, entre l'ouverture prévue de la nappe et le moment où elle commence vraiment à monter. */
export const CURTAIN_HOLD = 0.1;

let curtainCovering = false;
/** Instant prévu (performance.now(), ms) où la nappe commence à s'ouvrir. */
let curtainOpensAt = 0;

export function setCurtainCovering(covering: boolean, opensAt = 0) {
  curtainCovering = covering;
  curtainOpensAt = opensAt;
}

/** Secondes avant que l'écran de chargement ne s'ouvre (0 s'il est absent ou terminé). */
function loaderRemaining() {
  const el = document.querySelector(".loader");
  const anim = el?.getAnimations().find((a) => (a as CSSAnimation).animationName === "loader-out") as
    CSSAnimation | undefined;
  if (!anim || anim.playState === "finished") return 0;
  const delay = Number(anim.effect?.getTiming().delay ?? 0);
  const elapsed = Number(anim.currentTime ?? 0);
  return Math.max(0, (delay - elapsed) / 1000);
}

/** Secondes avant que la nappe de transition ne s'ouvre (la page arrive souvent pendant sa montée). */
function curtainRemaining() {
  if (!curtainCovering) return 0;
  return Math.max(0, (curtainOpensAt - performance.now()) / 1000) + CURTAIN_HOLD;
}

export function entranceDelay() {
  if (typeof document === "undefined") return 0;
  return Math.max(loaderRemaining(), curtainRemaining());
}
