import type { ReactNode } from "react";
import { DriftGrid } from "@/components/home/DriftGrid";

/**
 * The homepage's ground, for every other page: the same `.home` dark
 * tokens (so `paper`/`ink`/`line` utilities resolve to the night palette)
 * and the same gliding hairline grid behind it. Wrap a page's content in
 * this and it reads as the homepage's site, not a second light-themed one.
 * The whole wrapper is a dark scrim for the nav.
 */
export function DarkPage({ children }: { children: ReactNode }) {
  return (
    <div className="home relative" data-nav-scrim="light">
      <DriftGrid />
      {children}
    </div>
  );
}
