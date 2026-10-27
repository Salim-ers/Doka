import clsx from "clsx";
import { LOGO_LETTERS, LOGO_VIEWBOX } from "./logo-paths";

/** Largeur du logo sur le manchon (unités du dessin) et mise à l'échelle du tracé officiel. */
const LOGO_W = 64;
const LOGO_SCALE = LOGO_W / LOGO_VIEWBOX.width;

/**
 * Gobelet doka à emporter, en illustration : couvercle noir, gobelet crème, manchon orange
 * frappé du logo officiel, et trois volutes de vapeur qui montent (animées en CSS).
 */
export function DokaCup({ className }: { className?: string }) {
  return (
    <svg className={clsx("doka-cup", className)} viewBox="0 0 200 250" aria-hidden="true" focusable="false">
      <g className="doka-cup__steam" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
        <path d="M76 50c-9-9 9-16 0-26s7-15 0-22" />
        <path d="M100 46c-9-9 9-16 0-26s7-15 0-22" />
        <path d="M124 50c-9-9 9-16 0-26s7-15 0-22" />
      </g>
      {/* gobelet (légèrement conique) */}
      <path
        d="M52 92h96l-13.4 134.5a12 12 0 0 1-12 10.8H77.4a12 12 0 0 1-12-10.8z"
        fill="#FFFBEA"
        stroke="#171714"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* reflet */}
      <path d="M66 108l9.5 104" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      {/* manchon orange et logo */}
      <path d="M55.7 130h88.6l-5.6 56H61.3z" fill="#F14323" stroke="#171714" strokeWidth="6" strokeLinejoin="round" />
      <g
        transform={`translate(${100 - LOGO_W / 2} ${158 - (LOGO_VIEWBOX.height * LOGO_SCALE) / 2}) scale(${LOGO_SCALE})`}
      >
        {LOGO_LETTERS.map((l) => (
          <path key={l.id} d={l.d} fill="#FFFBEA" fillRule="evenodd" />
        ))}
      </g>
      {/* couvercle */}
      <rect x="40" y="74" width="120" height="20" rx="10" fill="#171714" />
      <path d="M58 76c2-13 8-18 18-18h48c10 0 16 5 18 18z" fill="#171714" />
      <rect x="86" y="62" width="28" height="6" rx="3" fill="#FFFBEA" opacity="0.35" />
    </svg>
  );
}
