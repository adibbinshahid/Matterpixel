"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Node = { x: number; y: number; vx: number; vy: number; magenta: boolean };

const MAX_LINK_DIST = 160;
const NODE_SPEED = 0.48;
// Fraction of width kept clear on each side of center — nodes/links never
// enter this band, so the headline/CTA column stays untouched.
const CENTER_BAND_HALF = 0.38;
// Shrink that band by this many px on each side, letting nodes drift closer in.
const CENTER_BAND_INSET_PX = 100;

/**
 * Low-opacity animated node network — dots drifting slowly and linking
 * to nearby neighbors with thin lines, like a world connectivity graph.
 * Confined to left/right margins, away from the center content column.
 * Canvas-based for perf with a couple dozen nodes. Pauses off-screen and
 * renders a single static frame under prefers-reduced-motion.
 */
export function NetworkBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let leftBound = 0;
    let rightBound = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let inView = true;

    function randomXOutsideBand() {
      const onLeft = Math.random() < 0.5;
      return onLeft ? Math.random() * leftBound : rightBound + Math.random() * (width - rightBound);
    }

    function makeNodes() {
      const area = width * height;
      const count = Math.min(70, Math.max(28, Math.round(area / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: randomXOutsideBand(),
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * NODE_SPEED,
        vy: (Math.random() - 0.5) * NODE_SPEED,
        magenta: Math.random() < 0.5,
      }));
    }

    function resize() {
      const el = canvas;
      if (!el) return;
      const rect = el.parentElement!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      const bandHalf = Math.max(0, width * CENTER_BAND_HALF - CENTER_BAND_INSET_PX);
      leftBound = width / 2 - bandHalf;
      rightBound = width / 2 + bandHalf;
      el.width = width * dpr;
      el.height = height * dpr;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeNodes();
    }

    function step() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        if (n.x > leftBound && n.x < rightBound) {
          n.x = n.x < width / 2 ? leftBound : rightBound;
          n.vx *= -1;
        }
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MAX_LINK_DIST) continue;
          const alpha = (1 - dist / MAX_LINK_DIST) * 0.2;
          ctx.strokeStyle = `rgba(44,75,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = n.magenta ? "rgba(255,46,147,0.2)" : "rgba(44,75,255,0.2)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.7, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced && inView) raf = requestAnimationFrame(step);
    }

    resize();
    step();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(step);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reduced]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
