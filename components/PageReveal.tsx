import type { ReactNode } from "react";

/**
 * First-load entrance for every page. CSS-only (`.page-reveal` in
 * globals.css) so the content is painted with the server HTML: the previous
 * framer-motion version rendered `opacity: 0; filter: blur(18px)` into that
 * HTML and kept the whole page invisible until hydration finished, which was
 * the single biggest cost in mobile LCP.
 */
export function PageReveal({ children }: { children: ReactNode }) {
  return <div className="page-reveal">{children}</div>;
}
