"use client";

import clsx from "clsx";
import { DLink } from "./DLink";

type Variant = "ink" | "orange" | "cream" | "outline" | "matcha";

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  icon?: React.ReactNode;
  className?: string;
};

type AsLink = Common & { href: string; external?: boolean; onClick?: never; type?: never };
type AsButton = Common & { href?: undefined; external?: never; onClick: () => void; type?: "button" | "submit" };

/**
 * Bouton Doka : une pastille dont le remplissage gonfle depuis le point d'entrée
 * du pointeur (comme une goutte de lait dans un café). Rend un lien interne,
 * un lien externe ou un <button> selon les props.
 */
export function DokaButton(props: AsLink | AsButton) {
  const { children, variant = "ink", size = "md", icon, className } = props;
  const cls = clsx("dbtn", `dbtn--${variant}`, size === "lg" && "dbtn--lg", className);

  const onPointerEnter = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--px", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--py", `${e.clientY - r.top}px`);
  };

  const inner = (
    <>
      <span className="dbtn__fill" aria-hidden="true" />
      <span className="dbtn__label">{children}</span>
      {icon && (
        <span className="dbtn__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  );

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a className={cls} href={props.href} target="_blank" rel="noopener noreferrer" onPointerEnter={onPointerEnter}>
          {inner}
          <span className="sr-only"> (nouvel onglet)</span>
        </a>
      );
    }
    return (
      <DLink className={cls} href={props.href} onPointerEnter={onPointerEnter}>
        {inner}
      </DLink>
    );
  }
  return (
    <button className={cls} type={props.type ?? "button"} onClick={props.onClick} onPointerEnter={onPointerEnter}>
      {inner}
    </button>
  );
}
