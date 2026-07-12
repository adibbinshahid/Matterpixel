"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const FEATURES = [
  "Free Expert Discussion!",
  "90+ Google PageSpeed Score!",
  "No Hidden Costs!",
  "Built From Scratch, No Templates!",
  "Live in Weeks, Not Months!",
  "SEO Ready From Day One!",
  "Revisions Until You Love It!",
  "100% Risk Free!",
  "Senior-Led, Always!",
];

const HOLD_MS = 900;
const EASE = [0.22, 1, 0.36, 1] as const;
const MIN_PX = 22;
const SHRINK = 0.8; // 20% smaller than the fitted size, per request

/** Trust strip between the hero subline and CTAs — one point at a time, on a loop. */
export function FeatureStrip() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [fontSizePx, setFontSizePx] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % FEATURES.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [index, reduced, inView]);

  // One uniform font size for every phrase — measured with an offscreen
  // canvas against the actual widest phrase (real glyph metrics, not a
  // char-count guess), so nothing ever clips, then shrunk 20% for margin.
  useLayoutEffect(() => {
    const el = containerRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!el || !ctx) return;

    function update() {
      if (!el || !ctx) return;
      const cw = el.clientWidth;
      const bodyFont = getComputedStyle(document.body).fontFamily;
      const REF = 100;
      ctx.font = `700 ${REF}px ${bodyFont}`;
      const widest = Math.max(...FEATURES.map((f) => ctx.measureText(f.toUpperCase()).width));
      const available = Math.max(0, cw - 32);
      const fit = widest > 0 ? (available / widest) * REF : REF;
      const vwCeiling = Math.min(108, Math.max(MIN_PX, window.innerWidth * 0.07));
      const raw = Math.min(fit, vwCeiling);
      // No MIN_PX floor here — fit is the hard guarantee against clipping;
      // forcing a minimum size can push a long phrase past the container.
      setFontSizePx(raw * SHRINK);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={wrapRef} className="flex w-full flex-col items-center gap-[10px]">
      <div className="relative inline-flex items-center">
        <span
          aria-hidden="true"
          className="absolute -inset-x-4 -inset-y-2 rounded-full bg-ink"
        />
        <p className="relative text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-paper">
          What every project includes
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative flex w-full items-center justify-center px-4"
        style={{ minHeight: fontSizePx ? fontSizePx * 1.3 : undefined }}
        role="status"
        aria-live="polite"
      >
        {reduced ? (
          <span
            className="whitespace-nowrap font-extrabold leading-tight text-magenta"
            style={{ fontSize: fontSizePx || undefined }}
          >
            {FEATURES[0]}
          </span>
        ) : (
          <AnimatePresence>
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 36, scale: 1.06, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -36, scale: 0.94, filter: "blur(16px)" }}
              transition={{ duration: 0.65, ease: EASE }}
              className="absolute w-full whitespace-nowrap text-center font-extrabold leading-tight text-magenta"
              style={{ fontSize: fontSizePx || undefined }}
            >
              {FEATURES[index]}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
