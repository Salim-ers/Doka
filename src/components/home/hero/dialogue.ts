/**
 * Le dialogue au guichet, synchronisé sur la boucle de la scène (secondes, 0 → LOOP = 12) :
 * le barista reconnaît un habitué, le client commande, le café passe de main en main
 * (HANDOFF_AT ≈ 4,45 s), puis chacun se salue pendant que le client repart.
 * Partagé par la scène 3D temps réel et la vidéo mobile (même minutage).
 */
export type Speaker = "customer" | "barista";

export const DIALOGUE: { who: Speaker; from: number; to: number; text: string }[] = [
  { who: "barista", from: 0.9, to: 2.4, text: "Salut ! Comme d'habitude ?" },
  { who: "customer", from: 2.55, to: 3.85, text: "Oui, un latte glacé !" },
  { who: "barista", from: 4.0, to: 5.45, text: "Et voilà, bien frais !" },
  { who: "customer", from: 5.6, to: 6.85, text: "Merci, à demain !" },
  { who: "barista", from: 7.0, to: 8.3, text: "Bonne journée !" },
];

/** Réplique en cours pour un personnage au temps `t` de la boucle (ou rien). */
export function lineAt(who: Speaker, t: number) {
  return DIALOGUE.find((l) => l.who === who && t >= l.from && t < l.to);
}

/** Position interpolée dans une piste échantillonnée à `fps` (boucle). */
export function sampleTrack(track: number[][], fps: number, t: number) {
  const n = track.length;
  const f = (((t * fps) % n) + n) % n;
  const i = Math.floor(f);
  const a = track[i];
  const b = track[(i + 1) % n];
  const k = f - i;
  return a.map((v, j) => v + (b[j] - v) * k);
}
