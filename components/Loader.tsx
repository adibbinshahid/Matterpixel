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

// The "M" icon's bounding box as a fraction of the full logo.png lockup
// (measured from the source asset: icon spans x 361-1349, y 331-924 of a
// 4920x1256 canvas) — lets us land on the icon's true center/size inside
// the nav's rendered lockup, not a guessed offset.
const ICON_WIDTH_FRAC = (1349 - 361) / 4920;
const ICON_HEIGHT_FRAC = (924 - 331) / 1256;
const ICON_CENTER_X_FRAC = 361 / 4920 + ICON_WIDTH_FRAC / 2;
const ICON_CENTER_Y_FRAC = 331 / 1256 + ICON_HEIGHT_FRAC / 2;

// Fly-easing tuned for a soft, premium deceleration into the landing spot.
const FLY_EASE = [0.16, 1, 0.3, 1] as const;

// Sequence timing (ms): blocks scatter in and settle, the assembled M
// holds still so it actually registers, then it flies to the nav.
const ASSEMBLE_MS = 700;
const HOLD_MS = 125;
const FLY_MS = 500;
const TOTAL_MS = ASSEMBLE_MS + HOLD_MS + FLY_MS;
const FLY_START_FRACTION = (ASSEMBLE_MS + HOLD_MS) / TOTAL_MS;

function hidePreloadMask() {
  const mask = document.getElementById("mp-preload-mask");
  if (mask) mask.style.display = "none";
}

/**
 * Intro: pixels scatter in and assemble the M, hold for a beat, then fly
 * to the exact on-screen position/size of the nav bar's logo mark
 * (measured live via its DOM rect, not a guessed offset) as the paper
 * overlay wipes away. A static mask (rendered in raw HTML, see layout.tsx)
 * covers the page until this component's first effect runs, so there's
 * never a flash of the underlying site either way. Skipped on repeat
 * visits in the same tab (sessionStorage) and reduced to an instant fade
 * under prefers-reduced-motion.
 */
export function Loader() {
  const [phase, setPhase] = useState<"idle" | "show" | "done">("idle");
  const [fly, setFly] = useState({ x: 0, y: 0, scale: 0.3 });
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    hidePreloadMask();

    const seen = sessionStorage.getItem("mp-loader-seen");
    if (seen) {
      setPhase("done");
      return;
    }

    const navMark = document.getElementById("nav-logo-mark");
    const rect = navMark?.getBoundingClientRect();
    const isSmUp = window.innerWidth >= 640;
    const loaderMarkPx = isSmUp ? 128 : 96; // matches h-24 / sm:h-32

    if (rect && rect.width > 0) {
      const iconCenterX = rect.left + ICON_CENTER_X_FRAC * rect.width;
      const iconCenterY = rect.top + ICON_CENTER_Y_FRAC * rect.height;
      const iconHeightPx = ICON_HEIGHT_FRAC * rect.height;
      setFly({
        x: iconCenterX - window.innerWidth / 2,
        y: iconCenterY - window.innerHeight / 2,
        scale: iconHeightPx / loaderMarkPx,
      });
    } else {
      // Fallback if the nav mark isn't found for some reason.
      setFly({ x: -(window.innerWidth / 2 - 32), y: -(window.innerHeight / 2 - 24), scale: 0.3 });
    }

    setPhase("show");
    sessionStorage.setItem("mp-loader-seen", "1");
    const t = setTimeout(() => setPhase("done"), reduced ? 350 : TOTAL_MS);
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
            animate={{ scale: [1, 1, fly.scale], x: [0, 0, fly.x], y: [0, 0, fly.y] }}
            transition={{
              duration: TOTAL_MS / 1000,
              times: [0, FLY_START_FRACTION, 1],
              ease: ["linear", FLY_EASE],
            }}
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
