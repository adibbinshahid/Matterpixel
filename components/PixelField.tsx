"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The hero's proprietary detail: a lattice of pixels that only resolves
 * where the visitor is actually looking.
 *
 * At rest it is a barely-there ink grid — the pixel motif the rest of the
 * page is built on, sitting so faint it reads as paper texture. Pixels
 * inside the cursor's radius take on brand color, scale up, and ease back
 * down as the pointer leaves. Nothing announces it; it is found by moving
 * the mouse, which is the entire point.
 *
 * Why canvas rather than DOM: a 1400x520 hero is ~1,400 cells. As elements
 * that's 1,400 nodes and 1,400 style writes a frame; as canvas it's one
 * node and one draw call's worth of fills, and it costs nothing when idle.
 *
 * Cost controls, in order of how much they matter:
 *  - the rAF loop only runs while the field is on screen AND still settling
 *    (`energy` above a floor). A parked pointer stops the loop entirely.
 *  - IntersectionObserver unmounts the loop when scrolled past.
 *  - reduced-motion renders one static frame of the resting grid and never
 *    starts a loop or listens for pointer moves at all.
 */

/** Grid pitch, px. */
const CELL = 22;
/** Side of each drawn square, px — small relative to CELL so the lattice
 * reads as discrete pixels rather than a filled checkerboard. */
const DOT = 3;
/** Radius of cursor influence, px. */
const RADIUS = 170;
/** Resting alpha of an untouched pixel. Deliberately near-invisible. */
const REST_ALPHA = 0.055;
/** Below this, the settle animation is done and the loop can stop. */
const ENERGY_FLOOR = 0.002;
/** Per-frame approach rate toward the pointer target (frame-rate damped). */
const TAU = 0.09;

export function PixelField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;

    /** Live pointer target, and the damped position actually drawn — the
     * gap between them is what makes the field feel like it has weight
     * instead of snapping to the cursor. */
    let targetX = -9999;
    let targetY = -9999;
    let drawX = -9999;
    let drawY = -9999;
    /** 0 = fully settled to the resting grid, 1 = fully lit. Drives both
     * the brightness and whether the loop is allowed to stop. */
    let energy = 0;
    let targetEnergy = 0;
    let lastTime = 0;

    function resize() {
      if (!canvas || !wrap || !ctx) return;
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const r2 = RADIUS * RADIUS;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const px = cx * CELL + CELL / 2;
          const py = cy * CELL + CELL / 2;

          const dx = px - drawX;
          const dy = py - drawY;
          const dist2 = dx * dx + dy * dy;

          // Squared-distance falloff, then squared again for a tighter,
          // more deliberate pool of light than a linear ramp gives.
          let lit = 0;
          if (dist2 < r2) {
            const t = 1 - dist2 / r2;
            lit = t * t * energy;
          }

          if (lit <= 0.001) {
            // Resting pixel — plain ink, no brand color, no scaling.
            ctx.fillStyle = `rgba(22, 22, 28, ${REST_ALPHA})`;
            ctx.fillRect(px - DOT / 2, py - DOT / 2, DOT, DOT);
            continue;
          }

          // Blue at the center of the pool grading to magenta at its edge:
          // the two brand accents are a gradient the visitor discovers by
          // moving, rather than a static two-tone pattern.
          const mix = 1 - lit;
          const rC = Math.round(44 + (255 - 44) * mix);
          const gC = Math.round(75 + (46 - 75) * mix);
          const bC = Math.round(255 + (147 - 255) * mix);

          // Lit pixels grow toward a full cell, so the pool reads as the
          // lattice resolving into a solid surface under the cursor.
          const size = DOT + (CELL - DOT - 6) * lit;
          const alpha = REST_ALPHA + (0.85 - REST_ALPHA) * lit;

          ctx.fillStyle = `rgba(${rC}, ${gC}, ${bC}, ${alpha})`;
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }
    }

    function tick(now: number) {
      const dt = Math.min(Math.max((now - lastTime) / 1000, 1 / 240), 1 / 20);
      lastTime = now;

      // Frame-rate-independent exponential damping — same model as
      // lib/useScrollFlow.ts, so the two motion systems on the page settle
      // with the same character.
      const k = 1 - Math.exp(-dt / TAU);
      drawX += (targetX - drawX) * k;
      drawY += (targetY - drawY) * k;
      energy += (targetEnergy - energy) * k;

      draw();

      const settled =
        Math.abs(targetEnergy - energy) < ENERGY_FLOOR &&
        Math.abs(targetX - drawX) < 0.5 &&
        Math.abs(targetY - drawY) < 0.5;

      // Stop rather than idle: a parked pointer costs zero frames.
      if (settled && targetEnergy === 0) {
        frame = 0;
        energy = 0;
        draw();
        return;
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (frame || !visible) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }

    function onPointerMove(e: PointerEvent) {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;

      targetEnergy = inside ? 1 : 0;
      if (inside) {
        // First contact should light up where the cursor *is*, not sweep
        // in from the off-canvas parking position.
        if (drawX < -1000) {
          drawX = x;
          drawY = y;
        }
        targetX = x;
        targetY = y;
      }
      start();
    }

    function onPointerLeave() {
      targetEnergy = 0;
      start();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    resize();

    // Reduced motion gets the resting lattice and nothing else — no
    // listeners, no loop.
    if (reduced) {
      return () => {
        ro.disconnect();
        io.disconnect();
      };
    }

    // Pointer tracking lives on window, not the canvas: the canvas is
    // `pointer-events: none` so it can never swallow a click on the
    // headline or CTA sitting above it.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full" />
    </div>
  );
}
