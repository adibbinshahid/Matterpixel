"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const LEAD = "We build websites that";

/** Kept grammatically consistent with the lead — every combo reads as one sentence. */
const PHRASES = [
  "load in under a second",
  "rank higher on Google",
  "convert visitors into customers",
  "score 90+ on PageSpeed",
  "look perfect on every screen",
  "are built to actually perform",
];

const HOLD_MS = 2200;
const EXIT_S = 0.5;
const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroCarousel() {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

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
    if (reduced || paused || !inView) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % PHRASES.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [index, reduced, paused, inView]);

  return (
    <div
      ref={wrapRef}
      className="flex flex-col items-center gap-1 text-center lg:items-start lg:text-left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="text-[clamp(1.05rem,1.6vw,1.4rem)] font-medium text-ink-soft">{LEAD}</p>

      <div
        className="relative flex min-h-[3.75rem] w-full max-w-sm items-start justify-center overflow-hidden lg:justify-start"
        role="status"
        aria-live="polite"
      >
        {reduced ? (
          <span className="text-[clamp(1.05rem,1.6vw,1.4rem)] font-bold leading-tight text-blue">
            {PHRASES[0]}
          </span>
        ) : (
          <AnimatePresence>
            <motion.span
              key={index}
              initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              exit={{ y: "-100%", opacity: 0, filter: "blur(0px)" }}
              transition={{ duration: EXIT_S, ease: EASE }}
              className="absolute left-1/2 top-0 w-full -translate-x-1/2 text-[clamp(1.05rem,1.6vw,1.4rem)] font-bold leading-tight text-blue lg:left-0 lg:translate-x-0"
            >
              {PHRASES[index]}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
