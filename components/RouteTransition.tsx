"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { DURATIONS, EASE } from "@/lib/utils";

/**
 * Per-navigation clip-path wipe reveal. Keyed by pathname so it retriggers
 * on every route change (the page content itself already fully remounts
 * between routes, so this costs nothing extra). Uses `clip-path`, not
 * `filter`/`transform` — those create a containing block for `position:
 * fixed` descendants (bit us once already with the pinned work section)
 * and clip-path doesn't. MotionConfig's reducedMotion="user" (set
 * globally in layout) makes this instant under prefers-reduced-motion.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: DURATIONS.transition, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
