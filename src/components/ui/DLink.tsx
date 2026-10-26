"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { usePageTransition } from "@/components/layout/PageTransition";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Lien interne Doka : vraie balise <a> (clic milieu, Cmd/Ctrl+clic, copie d'URL OK),
 * avec la transition de page orange sur un clic simple.
 */
export const DLink = forwardRef<HTMLAnchorElement, Props>(function DLink({ href, onClick, ...rest }, ref) {
  const { navigate } = usePageTransition();
  return (
    <Link
      ref={ref}
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (rest.target && rest.target !== "_self") return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
});
