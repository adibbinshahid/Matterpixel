"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { EASE } from "@/lib/utils";

// Matches #mp-load-mask's own timing (app/layout.tsx) — both should
// resolve together, so the black screen clears onto already-sharp
// content instead of clearing early onto a page that's still visibly
// blurring in on its own separate schedule.
const REVEAL_DURATION = 0.5;

/**
 * Linear-style page-load reveal: content starts softly blurred and
 * fades/sharpens into focus, unconditionally, shortly after mount.
 *
 * `filter: blur(0px)` — even though visually a no-op — still creates a
 * containing block for `position: fixed` descendants, which would break
 * GSAP ScrollTrigger's pinned work section. So once the reveal finishes,
 * the inline filter is cleared imperatively (not by swapping this wrapper
 * out of the tree — doing that forces React to remount every descendant,
 * which replayed every section's own one-time mount animation a second
 * time).
 */
export function PageReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: "blur(18px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: REVEAL_DURATION, ease: EASE }}
      onAnimationComplete={() => {
        // Motion commits its own final style write around the same time
        // this fires; clearing on the next frame avoids losing the race.
        requestAnimationFrame(() => {
          if (ref.current) ref.current.style.filter = "";
        });
      }}
    >
      {children}
    </motion.div>
  );
}
