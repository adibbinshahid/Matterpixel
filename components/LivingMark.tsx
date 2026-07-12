"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Same rects as the delivered mark (100x60 logical space, §mark.png). */
const MARK_RECTS: { x: number; y: number; w: number; h: number; color: "blue" | "magenta" }[] = [
  { x: 0, y: 0, w: 40, h: 20, color: "blue" },
  { x: 60, y: 0, w: 40, h: 20, color: "magenta" },
  { x: 0, y: 20, w: 20, h: 40, color: "blue" },
  { x: 40, y: 20, w: 20, h: 40, color: "blue" },
  { x: 80, y: 20, w: 20, h: 40, color: "magenta" },
];

const CELL = 4; // sampling grid in the 100x60 logical space (~250 particles)
const LOGICAL_W = 100;
const LOGICAL_H = 60;

type ParticleState = "assembling" | "idle" | "dissolving" | "scattered" | "reforming";

type Particle = {
  hx: number; // home x, canvas px
  hy: number; // home y, canvas px
  x: number;
  y: number;
  color: "blue" | "magenta";
  size: number;
  phase: number;
  freq: number;
  flickerPhase: number;
  opacity: number;
  state: ParticleState;
  stateT: number; // seconds elapsed in current state
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startDelay: number; // seconds before assembling begins (stagger)
  boost: number; // 0..1, cursor-proximity reactive intensity (idle only)
};

const DURATIONS = {
  assemble: 1.1,
  dissolveOut: 0.45,
  scatteredHold: 0.25,
  reform: 0.7,
};

function buildParticles(
  scale: number,
  offsetX: number,
  offsetY: number,
  width: number,
  height: number,
  skipIntro: boolean,
): Particle[] {
  const particles: Particle[] = [];
  for (const rect of MARK_RECTS) {
    const cols = Math.round(rect.w / CELL);
    const rows = Math.round(rect.h / CELL);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lx = rect.x + (c + 0.5) * (rect.w / cols);
        const ly = rect.y + (r + 0.5) * (rect.h / rows);
        const hx = offsetX + lx * scale;
        const hy = offsetY + ly * scale;
        // Scatter start point: random point outside the mark's footprint,
        // biased away from center so particles visibly fly inward.
        const scatterAngle = Math.random() * Math.PI * 2;
        const scatterR = Math.max(width, height) * (0.35 + Math.random() * 0.25);
        const startX = width / 2 + Math.cos(scatterAngle) * scatterR;
        const startY = height / 2 + Math.sin(scatterAngle) * scatterR;

        particles.push({
          hx,
          hy,
          x: skipIntro ? hx : startX,
          y: skipIntro ? hy : startY,
          color: rect.color,
          size: Math.max(2, CELL * scale * 0.72),
          phase: Math.random() * Math.PI * 2,
          freq: 0.4 + Math.random() * 0.5,
          flickerPhase: Math.random() * Math.PI * 2,
          opacity: skipIntro ? 1 : 0,
          state: skipIntro ? "idle" : "assembling",
          stateT: 0,
          fromX: skipIntro ? hx : startX,
          fromY: skipIntro ? hy : startY,
          toX: hx,
          toY: hy,
          startDelay: Math.random() * 0.5,
          boost: 0,
        });
      }
    }
  }
  return particles;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInCubic(t: number) {
  return t * t * t;
}

export function LivingMark({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, (v) => v * -8), {
    stiffness: 80,
    damping: 16,
  });
  const rotateY = useSpring(useTransform(rawX, (v) => v * 8), {
    stiffness: 80,
    damping: 16,
  });

  // Visibility gate — pause the rAF loop when scrolled offscreen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Gentle 3D tilt toward the cursor — fine-pointer devices only.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      rawX.set(Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2)));
      rawY.set(Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2)));
      pointerRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
      pointerRef.current = null;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, rawX, rawY]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let assembledOnce = false;

    function layout() {
      if (!wrap || !canvas || !ctx) return;
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.min(width / LOGICAL_W, height / LOGICAL_H) * 0.86;
      const offsetX = (width - LOGICAL_W * scale) / 2;
      const offsetY = (height - LOGICAL_H * scale) / 2;
      // Only play the scatter-in intro once — later layouts (window
      // resize, orientation change) should keep particles settled.
      particlesRef.current = buildParticles(
        scale,
        offsetX,
        offsetY,
        width,
        height,
        reduced || assembledOnce,
      );
      assembledOnce = true;
    }

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    let raf = 0;
    let last = performance.now();
    let dissolveTimer = 3 + Math.random() * 2;

    function triggerDissolve() {
      const particles = particlesRef.current;
      if (particles.length === 0) return;
      const anchor = particles[Math.floor(Math.random() * particles.length)];
      const radius = 16 + Math.random() * 14;
      for (const p of particles) {
        if (p.state !== "idle") continue;
        const d = Math.hypot(p.hx - anchor.hx, p.hy - anchor.hy);
        if (d < radius) {
          const angle = Math.atan2(p.hy - anchor.hy, p.hx - anchor.hx) || Math.random() * Math.PI * 2;
          p.fromX = p.x;
          p.fromY = p.y;
          p.toX = p.hx + Math.cos(angle) * (18 + Math.random() * 16);
          p.toY = p.hy + Math.sin(angle) * (18 + Math.random() * 16);
          p.state = "dissolving";
          p.stateT = 0;
        }
      }
    }

    function tick(now: number) {
      if (!ctx) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!reduced) {
        dissolveTimer -= dt;
        if (dissolveTimer <= 0) {
          triggerDissolve();
          dissolveTimer = 4 + Math.random() * 3;
        }
      }

      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        if (reduced) {
          ctx.fillStyle = p.color === "blue" ? "#2C4BFF" : "#FF2E93";
          drawParticle(ctx, p);
          continue;
        }

        p.stateT += dt;

        if (p.state === "assembling") {
          if (p.startDelay > 0) {
            p.startDelay -= dt;
          } else {
            const t = Math.min(1, p.stateT / DURATIONS.assemble);
            const e = easeOutCubic(t);
            p.opacity = e;
            p.x = p.fromX + (p.hx - p.fromX) * e;
            p.y = p.fromY + (p.hy - p.fromY) * e;
            if (t >= 1) {
              p.state = "idle";
              p.stateT = 0;
            }
          }
        } else if (p.state === "dissolving") {
          const t = Math.min(1, p.stateT / DURATIONS.dissolveOut);
          const e = easeInCubic(t);
          p.opacity = 1 - e;
          p.x = p.fromX + (p.toX - p.fromX) * e;
          p.y = p.fromY + (p.toY - p.fromY) * e;
          if (t >= 1) {
            p.state = "scattered";
            p.stateT = 0;
          }
        } else if (p.state === "scattered") {
          p.opacity = 0;
          if (p.stateT >= DURATIONS.scatteredHold) {
            p.fromX = p.x;
            p.fromY = p.y;
            p.state = "reforming";
            p.stateT = 0;
          }
        } else if (p.state === "reforming") {
          const t = Math.min(1, p.stateT / DURATIONS.reform);
          const e = easeOutCubic(t);
          p.opacity = e;
          p.x = p.fromX + (p.hx - p.fromX) * e;
          p.y = p.fromY + (p.hy - p.fromY) * e;
          if (t >= 1) {
            p.state = "idle";
            p.stateT = 0;
          }
        } else {
          // idle — gentle continuous wander + flicker, plus a cursor-
          // proximity boost: nearby pixels lighten, pop slightly larger,
          // and drift outward, then spring back as the cursor moves away.
          const wobbleX = Math.sin(now * 0.001 * p.freq + p.phase) * 1.6;
          const wobbleY = Math.cos(now * 0.0013 * p.freq + p.phase) * 1.6;

          let targetBoost = 0;
          let dirX = 0;
          let dirY = 0;
          const pointer = pointerRef.current;
          if (pointer) {
            const dx = p.hx - pointer.x;
            const dy = p.hy - pointer.y;
            const dist = Math.hypot(dx, dy);
            const radius = Math.min(width, height) * 0.22;
            if (dist < radius && dist > 0.001) {
              targetBoost = 1 - dist / radius;
              dirX = dx / dist;
              dirY = dy / dist;
            }
          }
          p.boost += (targetBoost - p.boost) * Math.min(1, dt * 6);

          p.x = p.hx + wobbleX + dirX * p.boost * 4;
          p.y = p.hy + wobbleY + dirY * p.boost * 4;
          p.opacity = Math.min(
            1,
            0.82 + Math.sin(now * 0.0009 + p.flickerPhase) * 0.18 + p.boost * 0.3,
          );
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fillStyle = p.color === "blue" ? "#2C4BFF" : "#FF2E93";
        if (p.boost > 0.001) {
          const grownSize = p.size * (1 + 0.3 * p.boost);
          const half = grownSize / 2;
          ctx.fillRect(p.x - half, p.y - half, grownSize, grownSize);
        } else {
          drawParticle(ctx, p);
        }
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(tick);
    }

    function drawParticle(context: CanvasRenderingContext2D, p: Particle) {
      const half = p.size / 2;
      context.fillRect(p.x - half, p.y - half, p.size, p.size);
    }

    if (inView) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    } else {
      // Draw a single resting frame so the mark doesn't vanish while paused.
      ctx.clearRect(0, 0, width, height);
      for (const p of particlesRef.current) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.color === "blue" ? "#2C4BFF" : "#FF2E93";
        ctx.fillRect(p.hx - p.size / 2, p.hy - p.size / 2, p.size, p.size);
      }
    }

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [inView, reduced]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ perspective: 900 }}
      aria-hidden="true"
    >
      <motion.div
        className="h-full w-full"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </motion.div>
    </div>
  );
}
