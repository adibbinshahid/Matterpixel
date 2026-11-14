"use client";

import { useEffect, useRef } from "react";
import { useReveal } from "@/lib/useReveal";
import { Hl } from "@/components/home/Hl";
import { CtaLink } from "@/components/CtaLink";
import { easeOutExpo, markCells, prefersReducedMotion, rng } from "@/lib/pixels";

const COLS = 30;
const FLIGHT_MS = 900;
const STAGGER_MS = 700;
/** Hover: reach of the pointer, in cells, and how far blocks are pushed. */
const HOVER_RADIUS = 4.5;
const HOVER_PUSH = 1.4;

/**
 * The page's close: the Matterpixel M, built from the same pixel blocks the
 * rest of the page has been throwing around, assembles behind the last line
 * the first time it scrolls into view, then holds. Reduced motion draws the
 * finished mark. The canvas repaints the finished mark on resize.
 */
function PixelMark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { cells, cols, rows } = markCells(COLS);
    let done = false;
    let raf = 0;

    const layout = () => {
      const w = Math.round(canvas.clientWidth);
      const cell = Math.floor(w / cols);
      canvas.width = cell * cols;
      canvas.height = cell * rows;
      return { cell, ctx: canvas.getContext("2d")!, w: canvas.width, h: canvas.height };
    };

    // Per-block hover state: current offset / scale, eased toward a target
    // set by the pointer. At rest every block is at 0 / 1.
    const live = cells.map(() => ({ x: 0, y: 0, s: 1 }));
    let pointer: { x: number; y: number } | null = null;
    let hoverRaf = 0;

    const drawFinal = () => {
      const { cell, ctx, w, h } = layout();
      ctx.clearRect(0, 0, w, h);
      const gap = Math.max(1, Math.round(cell * 0.12));
      cells.forEach((c, k) => {
        const b = live[k];
        const size = (cell - gap) * b.s;
        const off = (cell - gap - size) / 2;
        ctx.fillStyle = c.color;
        ctx.fillRect(c.c * cell + b.x + off, c.r * cell + b.y + off, size, size);
      });
    };

    // Hover: blocks near the pointer scatter outward and shrink, as if the
    // mark were being pulled apart pixel by pixel; when the pointer leaves
    // they spring back into the mark.
    const hoverFrame = () => {
      const cell = Math.floor(Math.round(canvas.clientWidth) / cols);
      const R = cell * HOVER_RADIUS;
      let moving = false;
      cells.forEach((c, k) => {
        const b = live[k];
        let tx = 0;
        let ty = 0;
        let ts = 1;
        if (pointer) {
          const cx = c.c * cell + cell / 2;
          const cy = c.r * cell + cell / 2;
          const dx = cx - pointer.x;
          const dy = cy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            const f = Math.pow(1 - d / R, 2);
            const n = d || 1;
            tx = (dx / n) * f * cell * HOVER_PUSH;
            ty = (dy / n) * f * cell * HOVER_PUSH;
            ts = 1 - f * 0.55;
          }
        }
        b.x += (tx - b.x) * 0.18;
        b.y += (ty - b.y) * 0.18;
        b.s += (ts - b.s) * 0.18;
        if (Math.abs(tx - b.x) > 0.1 || Math.abs(ty - b.y) > 0.1 || Math.abs(ts - b.s) > 0.002) moving = true;
      });
      // Settled with nothing hovering: snap exactly home so the mark is
      // pixel-identical to how it rested before.
      if (!moving && !pointer) live.forEach((b) => ((b.x = 0), (b.y = 0), (b.s = 1)));
      drawFinal();
      hoverRaf = moving || pointer ? requestAnimationFrame(hoverFrame) : 0;
    };
    const kick = () => {
      if (!hoverRaf) hoverRaf = requestAnimationFrame(hoverFrame);
    };
    const onMove = (e: PointerEvent) => {
      if (!done || e.pointerType !== "mouse" || prefersReducedMotion()) return;
      const r = canvas.getBoundingClientRect();
      // Canvas backing store is sized to whole cells; map CSS px to it.
      const sx = canvas.width / r.width;
      pointer = { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sx };
      kick();
    };
    const onLeave = () => {
      pointer = null;
      kick();
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const assemble = () => {
      const { cell, ctx, w, h } = layout();
      const gap = Math.max(1, Math.round(cell * 0.12));
      const rand = rng(42);
      const flights = cells.map((c) => ({
        ...c,
        // Blocks come in from the left, where the copy is, and from below.
        fx: -w * (0.3 + rand() * 0.6),
        fy: (rand() - 0.2) * h * 0.9,
        delay: (c.c / cols) * STAGGER_MS * 0.6 + rand() * STAGGER_MS * 0.4,
      }));
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = now - t0;
        ctx.clearRect(0, 0, w, h);
        for (const f of flights) {
          const p = Math.min(1, Math.max(0, (t - f.delay) / FLIGHT_MS));
          if (p <= 0) continue;
          const e = easeOutExpo(p);
          ctx.globalAlpha = Math.min(1, p * 3);
          ctx.fillStyle = f.color;
          ctx.fillRect(f.c * cell + f.fx * (1 - e), f.r * cell + f.fy * (1 - e), cell - gap, cell - gap);
        }
        ctx.globalAlpha = 1;
        if (t < STAGGER_MS + FLIGHT_MS) raf = requestAnimationFrame(frame);
        else done = true;
      };
      raf = requestAnimationFrame(frame);
    };

    if (prefersReducedMotion()) {
      drawFinal();
      done = true;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done) return;
        io.disconnect();
        assemble();
      },
      { threshold: 0.35 },
    );
    if (!done) io.observe(canvas);

    const ro = new ResizeObserver(() => done && drawFinal());
    ro.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(hoverRaf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-auto block aspect-[3/2] w-full" />;
}

export function ClosingCta() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);
  return (
    <section ref={sectionRef} data-nav-scrim="light" aria-labelledby="closing-title" className="relative overflow-hidden">
      <div className="home-shell relative py-24 lg:py-36">
        {/* Phones: the M stands above the line. From lg it sits in its own
            column right of the copy, close enough to read as the line's
            backdrop without a block ever crossing the text. */}
        <div className="pointer-events-none mb-12 w-2/3 max-w-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:mb-0 lg:flex lg:w-[50%] lg:max-w-none lg:items-center lg:px-8">
          <div className="w-full">
            <PixelMark />
          </div>
        </div>

        <div className="relative max-w-[34rem]">
          <p data-reveal="eyebrow" className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-magenta" />
            Free audit
          </p>
          <h2
            id="closing-title"
            data-reveal="title"
            className="mt-4 text-balance text-[clamp(2.5rem,1.6rem+4vw,5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-white [text-shadow:0_2px_30px_rgba(10,11,16,0.6)]"
          >
            Let&rsquo;s <Hl tone="blue">build</Hl> your next <Hl tone="magenta">win</Hl>.
          </h2>
          <p data-reveal="lede" className="mt-6 max-w-[38ch] text-base leading-relaxed text-white/80 sm:text-lg">
            Claim your free audit and allow us to see exactly what&rsquo;s holding your growth back.
          </p>
          <div data-reveal="block" className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
            <CtaLink section="closing" cta="book" className="w-fit" />
            <CtaLink section="closing" cta="quote" variant="text" className="text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}
