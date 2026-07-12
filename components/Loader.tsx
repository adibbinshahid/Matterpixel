"use client";

import { useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Same block layout as public/mark.png (0-100 x, 0-60 y coordinate space).
const W = 100;
const H = 60;
const BLOCKS: { x: number; y: number; w: number; h: number; color: "blue" | "magenta" }[] = [
  { x: 0, y: 0, w: 40, h: 20, color: "blue" },
  { x: 60, y: 0, w: 40, h: 20, color: "magenta" },
  { x: 0, y: 20, w: 20, h: 40, color: "blue" },
  { x: 40, y: 20, w: 20, h: 40, color: "blue" },
  { x: 80, y: 20, w: 20, h: 40, color: "magenta" },
];

/**
 * ~1.2s intro: pixels scatter in and assemble the M, then fly toward the
 * nav mark as the paper overlay wipes away. Skipped on repeat visits in
 * the same tab (sessionStorage) and reduced to an instant fade under
 * prefers-reduced-motion.
 */
export function Loader() {
  const [phase, setPhase] = useState<"idle" | "show" | "done">("idle");
  const [flyTarget, setFlyTarget] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const seen = sessionStorage.getItem("mp-loader-seen");
    if (seen) {
      setPhase("done");
      return;
    }
    setFlyTarget({
      x: -(window.innerWidth / 2 - 32),
      y: -(window.innerHeight / 2 - 24),
    });
    setPhase("show");
    sessionStorage.setItem("mp-loader-seen", "1");
    const t = setTimeout(() => setPhase("done"), reduced ? 350 : 1150);
    return () => clearTimeout(t);
  }, [reduced]);

  return (
    <AnimatePresence>
      {phase === "show" && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-paper"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          role="status"
          aria-label="Loading Matterpixel"
        >
          <motion.div
            className="relative h-24 sm:h-32"
            style={{ aspectRatio: `${W} / ${H}` }}
            animate={{ scale: [1, 1, 0.3], x: [0, 0, flyTarget.x], y: [0, 0, flyTarget.y] }}
            transition={{ duration: 1.15, times: [0, 0.62, 1], ease: EASE }}
          >
            {BLOCKS.map((b, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${(b.x / W) * 100}%`,
                  top: `${(b.y / H) * 100}%`,
                  width: `${(b.w / W) * 100}%`,
                  height: `${(b.h / H) * 100}%`,
                  background: b.color === "blue" ? "var(--blue)" : "var(--magenta)",
                }}
                initial={{
                  opacity: 0,
                  x: (Math.random() - 0.5) * 260,
                  y: (Math.random() - 0.5) * 260,
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.55, delay: i * 0.035, ease: EASE }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
