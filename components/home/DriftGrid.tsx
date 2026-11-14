"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/pixels";

/** Grid cell, px. The layer overhangs the viewport by one cell on every
 * side, so any offset within a cell never shows an edge. */
const CELL = 64;
/** Grid travels at this fraction of the scroll: slower than the content,
 * which reads as depth. */
const PARALLAX = 0.25;
/** Glide speed, px per second. */
const SPEED = 9;
/** Heading of the glide: mostly left→right, rising slightly (radians,
 * -0.21 ≈ 12° above horizontal). It sways ±6° over ~70s so the travel
 * feels organic rather than mechanical, but never turns vertical. */
const HEADING = -0.21;
const SWAY = 0.1;

/**
 * The homepage's dark ground: a hairline grid behind every dark section,
 * gliding slowly left-to-right on a shallow angle and lagging the scroll
 * for parallax. One fixed layer for the whole page — light sections paint
 * over it with their own opaque ground.
 *
 * Smooth by construction: the glide is integrated per frame from real
 * elapsed time (so a dropped frame never jerks), positions stay sub-pixel
 * (whole-pixel rounding stepped visibly at this speed), and the only
 * per-frame work is one translate3d on a composited layer. The grid is
 * periodic, so wrapping the offset within one cell is seamless. The loop
 * stops while the tab is hidden; reduced motion gets the grid, still.
 */
export function DriftGrid() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || prefersReducedMotion()) return;
    let raf = 0;
    let last = 0;
    let x = 0;
    let y = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      // Clamp dt so returning from a background tab doesn't leap.
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      const heading = HEADING + SWAY * Math.sin((now - t0) / 11000);
      x += Math.cos(heading) * SPEED * dt;
      y += Math.sin(heading) * SPEED * dt;
      const ox = ((x % CELL) + CELL) % CELL;
      const oy = (((y - window.scrollY * PARALLAX) % CELL) + CELL) % CELL;
      layer.style.transform = `translate3d(${(ox - CELL).toFixed(2)}px, ${(oy - CELL).toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };
    start();
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return (
    <div aria-hidden="true" className="drift-grid">
      <div ref={layerRef} className="drift-grid-layer" />
    </div>
  );
}
