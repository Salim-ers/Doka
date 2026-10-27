/**
 * Délai des animations de début de page. Au premier affichage, l'écran de chargement
 * couvre la page ; lors d'une navigation, c'est la nappe de transition. Les titres et le
 * hero attendent qu'ils commencent à s'ouvrir, pour s'animer sous les yeux du visiteur
 * plutôt que derrière.
 */

/** Durée (s), environ, entre l'arrivée de la nouvelle page et le début de l'ouverture de la nappe. */
export const CURTAIN_HOLD = 0.1;

let curtainCovering = false;

export function setCurtainCovering(covering: boolean) {
  curtainCovering = covering;
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

export function entranceDelay() {
  if (typeof document === "undefined") return 0;
  return Math.max(loaderRemaining(), curtainCovering ? CURTAIN_HOLD : 0);
}
