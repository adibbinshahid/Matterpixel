"use client";

import { useEffect, type ReactNode } from "react";
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
/** False until the first page has mounted. The first load skips the wipe:
 * starting clipped would ship the server HTML hidden until hydration (the
 * wipe can't run before then), and the first paint is LCP. Only client-side
 * navigations after that get the transition. */
let hasMounted = false;

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const animateIn = hasMounted;

  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <motion.div
      key={pathname}
      initial={animateIn ? { clipPath: "inset(0% 0% 100% 0%)" } : false}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: DURATIONS.transition, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
