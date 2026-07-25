"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Group = "frame" | "dot" | "content" | "card" | "address" | "sidebarFill" | "contentFill";

type Particle = {
  ox: number; // noise origin (px, local to canvas)
  oy: number;
  tx: number; // converged target (px)
  ty: number;
  size: number;
  phase: number;
  group: Group;
  colorIdx: number;
  delay: number; // ms after start before this particle begins moving
  duration: number; // ms this particle takes to travel ox/oy -> tx/ty
};

const CONVERGE_MS = 2200; // phase 1: noise -> wireframe outline
const FILL_MS = 1300; // phase 2: outline -> solid browser window
const MOUSE_RADIUS = 70;
const MOUSE_STRENGTH = 20;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

/** Segments in normalized [0,1] box space: [x0,y0,x1,y1]. */
function rectSegments(x0: number, y0: number, x1: number, y1: number): [number, number, number, number][] {
  return [
    [x0, y0, x1, y0],
    [x1, y0, x1, y1],
    [x1, y1, x0, y1],
    [x0, y1, x0, y0],
  ];
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Normalized shape geometry, shared between particle placement and the
// solid-fill rects drawn once formation completes.
const OUTER = { x0: 0.05, y0: 0.14, x1: 0.95, y1: 0.88 };
const CHROME_Y = 0.26;
const ADDRESS = { x0: 0.22, y0: 0.175, x1: 0.75, y1: 0.225 };
const SIDEBAR = { x0: 0.76, y0: 0.34, x1: 0.89, y1: 0.8 };
const CONTENT_LINES = [
  { y: 0.4, width: 0.66 },
  { y: 0.52, width: 0.5 },
  { y: 0.65, width: 0.58 },
];

/**
 * CTA visual: thousands of tiny pixels start as scattered noise, converge
 * into a wireframe browser outline, then a second wave fills in solid —
 * address bar, sidebar card, thicker content rows — so the end state reads
 * as an actual browser window, not just a dotted sketch. Canvas-drawn (not
 * DOM nodes) so this costs nothing at rest. Once fully formed, the cursor
 * liquifies nearby pixels — only while hovering directly over the box.
 */
export function PixelFormationVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const cv = canvas;
    const wr = wrap;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let startTime: number | null = null;
    let rafId = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    function distributeAlongSegments(
      segments: { seg: [number, number, number, number]; group: Group }[],
      count: number,
      delay: number,
      duration: number,
    ) {
      const totalLen = segments.reduce((sum, { seg }) => {
        const [x0, y0, x1, y1] = seg;
        return sum + Math.hypot((x1 - x0) * w, (y1 - y0) * h);
      }, 0);

      segments.forEach(({ seg, group }) => {
        const [x0, y0, x1, y1] = seg;
        const len = Math.hypot((x1 - x0) * w, (y1 - y0) * h);
        const n = Math.max(2, Math.round((len / (totalLen || 1)) * count));
        for (let i = 0; i < n; i++) {
          const t = n === 1 ? 0.5 : i / (n - 1);
          const jitter = (Math.random() - 0.5) * 0.006;
          const nx = x0 + (x1 - x0) * t + jitter;
          const ny = y0 + (y1 - y0) * t + jitter;
          particles.push({
            ox: 0,
            oy: 0,
            tx: nx * w,
            ty: ny * h,
            size: 1.5 + Math.random() * 1.5,
            phase: Math.random() * Math.PI * 2,
            group,
            colorIdx: i % 3,
            delay,
            duration,
          });
        }
      });
    }

    function fillGrid(x0: number, y0: number, x1: number, y1: number, spacingPx: number, group: Group, delay: number, duration: number) {
      const pxW = (x1 - x0) * w;
      const pxH = (y1 - y0) * h;
      const cols = Math.max(1, Math.round(pxW / spacingPx));
      const rows = Math.max(1, Math.round(pxH / spacingPx));
      for (let r = 0; r <= rows; r++) {
        for (let col = 0; col <= cols; col++) {
          const nx = x0 + (x1 - x0) * (col / cols) + (Math.random() - 0.5) * 0.004;
          const ny = y0 + (y1 - y0) * (r / rows) + (Math.random() - 0.5) * 0.004;
          particles.push({
            ox: 0,
            oy: 0,
            tx: nx * w,
            ty: ny * h,
            size: 1.3 + Math.random(),
            phase: Math.random() * Math.PI * 2,
            group,
            colorIdx: (r + col) % 3,
            delay,
            duration,
          });
        }
      }
    }

    function buildParticles() {
      particles = [];

      // Phase 1: wireframe outline (browser border + chrome divider + dots + thin content lines).
      const outlineSegments: { seg: [number, number, number, number]; group: Group }[] = [];
      rectSegments(OUTER.x0, OUTER.y0, OUTER.x1, OUTER.y1).forEach((seg) => outlineSegments.push({ seg, group: "frame" }));
      outlineSegments.push({ seg: [OUTER.x0, CHROME_Y, OUTER.x1, CHROME_Y], group: "frame" });
      CONTENT_LINES.forEach(({ y, width }) => {
        outlineSegments.push({ seg: [0.12, y, 0.12 + width, y], group: "content" });
      });
      rectSegments(SIDEBAR.x0, SIDEBAR.y0, SIDEBAR.x1, SIDEBAR.y1).forEach((seg) => outlineSegments.push({ seg, group: "card" }));

      const dotCount = 18;
      [0.1, 0.13, 0.16].forEach((cx, i) => {
        for (let k = 0; k < dotCount / 3; k++) {
          const a = (k / (dotCount / 3)) * Math.PI * 2;
          particles.push({
            ox: 0,
            oy: 0,
            tx: (cx + Math.cos(a) * 0.012) * w,
            ty: (0.2 + Math.sin(a) * 0.012) * h,
            size: 1.5 + Math.random(),
            phase: Math.random() * Math.PI * 2,
            group: "dot",
            colorIdx: i,
            delay: 0,
            duration: CONVERGE_MS,
          });
        }
      });
      distributeAlongSegments(outlineSegments, 540 - dotCount, 0, CONVERGE_MS);

      // Phase 2: solid fill — address bar, sidebar card, thicker content rows.
      // Starts scattered in the same noise field but doesn't move until
      // the outline (phase 1) has finished, so it reads as a second wave.
      fillGrid(ADDRESS.x0, ADDRESS.y0, ADDRESS.x1, ADDRESS.y1, 6, "address", CONVERGE_MS, FILL_MS);
      fillGrid(SIDEBAR.x0 + 0.006, SIDEBAR.y0 + 0.01, SIDEBAR.x1 - 0.006, SIDEBAR.y1 - 0.01, 7, "sidebarFill", CONVERGE_MS, FILL_MS);
      CONTENT_LINES.forEach(({ y, width }) => {
        const extraSegs: { seg: [number, number, number, number]; group: Group }[] = [
          { seg: [0.12, y + 0.014, 0.12 + width, y + 0.014], group: "contentFill" },
          { seg: [0.12, y - 0.014, 0.12 + width * 0.85, y - 0.014], group: "contentFill" },
        ];
        distributeAlongSegments(extraSegs, 34, CONVERGE_MS, FILL_MS);
      });

      particles.forEach((p) => {
        p.ox = (Math.random() * 1.3 - 0.15) * w;
        p.oy = (Math.random() * 1.3 - 0.15) * h;
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wr.clientWidth;
      h = wr.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    }

    function colorFor(p: Particle): string {
      if (p.group === "dot") return ["rgba(255,46,147,0.85)", "rgba(44,75,255,0.85)", "rgba(255,255,255,0.7)"][p.colorIdx];
      if (p.group === "card") return "rgba(44,75,255,0.55)";
      if (p.group === "sidebarFill") return "rgba(44,75,255,0.32)";
      if (p.group === "address") return "rgba(255,255,255,0.6)";
      if (p.group === "content" || p.group === "contentFill") return p.colorIdx === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)";
      return "rgba(255,255,255,0.45)";
    }

    function drawSolidBase(fillEase: number) {
      if (fillEase <= 0) return;
      const x0 = OUTER.x0 * w;
      const y0 = OUTER.y0 * h;
      const x1 = OUTER.x1 * w;
      const chromeY = CHROME_Y * h;

      c.fillStyle = `rgba(255,255,255,${0.05 * fillEase})`;
      c.fillRect(x0, y0, x1 - x0, chromeY - y0);

      roundRectPath(c, ADDRESS.x0 * w, ADDRESS.y0 * h, (ADDRESS.x1 - ADDRESS.x0) * w, (ADDRESS.y1 - ADDRESS.y0) * h, 8);
      c.fillStyle = `rgba(255,255,255,${0.16 * fillEase})`;
      c.fill();

      roundRectPath(c, SIDEBAR.x0 * w, SIDEBAR.y0 * h, (SIDEBAR.x1 - SIDEBAR.x0) * w, (SIDEBAR.y1 - SIDEBAR.y0) * h, 6);
      c.fillStyle = `rgba(44,75,255,${0.18 * fillEase})`;
      c.fill();

      roundRectPath(c, x0, y0, x1 - x0, OUTER.y1 * h - y0, 10);
      c.lineWidth = 1.5;
      c.strokeStyle = `rgba(255,255,255,${0.4 * fillEase})`;
      c.stroke();
    }

    function renderFrame(elapsed: number, isStatic: boolean) {
      c.clearRect(0, 0, w, h);

      const fillEase = easeOutCubic(clamp01((elapsed - CONVERGE_MS) / FILL_MS));
      drawSolidBase(fillEase);

      const fullyFormed = elapsed >= CONVERGE_MS + FILL_MS;

      for (const p of particles) {
        const localT = isStatic ? 1 : clamp01((elapsed - p.delay) / p.duration);
        const ease = easeOutCubic(localT);
        let x = lerp(p.ox, p.tx, ease);
        let y = lerp(p.oy, p.ty, ease);

        if (!isStatic && fullyFormed) {
          x += Math.sin(elapsed / 1400 + p.phase) * 2.5;
          y += Math.cos(elapsed / 1600 + p.phase) * 2.5;

          if (mouse.active) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < MOUSE_RADIUS && dist > 0.01) {
              const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
              x += (dx / dist) * force * MOUSE_STRENGTH;
              y += (dy / dist) * force * MOUSE_STRENGTH;
            }
          }
        }

        c.fillStyle = colorFor(p);
        c.fillRect(x - p.size / 2, y - p.size / 2, p.size, p.size);
      }
    }

    function draw(now: number) {
      if (startTime === null) startTime = now;
      renderFrame(now - startTime, false);
      rafId = requestAnimationFrame(draw);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onPointerLeave() {
      mouse.active = false;
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wr);

    if (reduced) {
      renderFrame(CONVERGE_MS + FILL_MS, true);
      return () => resizeObserver.disconnect();
    }

    // Replays every time the section scrolls into view — not just once —
    // so leaving and coming back (either scroll direction) always re-runs
    // the noise -> outline -> solid formation from the start.
    let active = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          active = true;
          startTime = null;
          rafId = requestAnimationFrame(draw);
        } else if (!entry.isIntersecting && active) {
          active = false;
          cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(wr);

    // Hover-liquify only reacts while the cursor is directly over this box.
    cv.addEventListener("pointermove", onPointerMove);
    cv.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      resizeObserver.disconnect();
      cv.removeEventListener("pointermove", onPointerMove);
      cv.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="relative mx-auto h-56 w-72 shrink-0 sm:h-64 sm:w-80 lg:h-72 lg:w-[26rem]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
