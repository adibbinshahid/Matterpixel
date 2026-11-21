import type { ReactNode } from "react";
import { DriftGrid } from "@/components/home/DriftGrid";
import { PageSeam } from "@/components/PageSeam";

/**
 * The detail pages' ground (case studies, service details, articles): the
 * whole body on the light palette (`.home-light`), no grid, closing on the
 * site-wide dark ClosingCta. The `.home` wrapper and the fixed DriftGrid
 * sit underneath so the closing section still lands on the dark grid; the
 * light body is opaque and paints over the grid until then. The body marks
 * itself `data-nav-light` so the nav reads light over it; ClosingCta marks
 * its own dark scrim.
 */
export function LightPage({ children, closing }: { children: ReactNode; closing: ReactNode }) {
  return (
    <div className="home relative">
      <DriftGrid />
      <div data-nav-light="" className="home-light relative isolate">
        {children}
        <PageSeam edge="bottom" />
      </div>
      {closing}
    </div>
  );
}
