"use client";

import { useCallback } from "react";

/**
 * One shared scroll-velocity clock, for connector systems that need to look
 * like something is flowing through them.
 *
 * The model is: raw scroll velocity → normalise → clamp → damp → flow speed.
 * A single rAF loop owns the phase; every subscriber is handed the same
 * number and writes it straight to the DOM. Nothing here touches React
 * state, so a fast scroll costs one loop and N style writes per frame, not
 * N renders.
 *
 * The loop only exists while something is subscribed — CrewThread drops its
 * subscription when the diagram is out of view, so an idle page runs no
 * frames at all.
 *
 * `phase` is normalised to a 0–100 travel along a path (paths declare
 * `pathLength={100}`), which is why speeds below read as "units per second":
 * IDLE alone crosses a connector in ~14s, IDLE + BOOST in ~1.6s.
 */

type Subscriber = (phase: number, intensity: number) => void;

/** Normalised path length every consumer draws against. */
const PERIOD = 100;
/** Resting drift — the system is never fully dead, just calm. */
const IDLE = 7;
/** Added on top of IDLE at full scroll intensity. */
const BOOST = 55;
/** Scroll speed (px/s) that counts as "as fast as this reacts to". */
const REF_VELOCITY = 1400;
/** Damping constants — quick to answer a scroll, slow to settle after it. */
const TAU_UP = 0.1;
const TAU_DOWN = 0.6;

const subscribers = new Set<Subscriber>();

let frame = 0;
let lastTime = 0;
let lastY = 0;
let phase = 0;
let intensity = 0;

function tick(now: number) {
  frame = requestAnimationFrame(tick);

  // Clamped so a backgrounded tab resuming can't jump the phase, and a
  // 240Hz display can't divide by ~0 when deriving velocity.
  const dt = Math.min(Math.max((now - lastTime) / 1000, 1 / 240), 1 / 20);
  lastTime = now;

  const y = window.scrollY;
  const velocity = Math.abs(y - lastY) / dt;
  lastY = y;

  const target = Math.min(velocity / REF_VELOCITY, 1);
  // Frame-rate independent exponential damping, asymmetric so the flow
  // accelerates with the scroll but coasts down after it stops.
  const tau = target > intensity ? TAU_UP : TAU_DOWN;
  intensity += (target - intensity) * (1 - Math.exp(-dt / tau));

  phase = (phase + (IDLE + BOOST * intensity) * dt) % PERIOD;

  for (const fn of subscribers) fn(phase, intensity);
}

function subscribe(fn: Subscriber) {
  subscribers.add(fn);
  if (subscribers.size === 1) {
    lastTime = performance.now();
    lastY = window.scrollY;
    frame = requestAnimationFrame(tick);
  }
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

/**
 * Drives every `<path>` inside a group along its own dash pattern.
 *
 * Each path declares `data-flow-lag` (how far behind the pulse head that
 * layer sits) and the group declares `data-flow-stage` (where this stretch
 * of connector sits in the brief → lead → specialists → result run), so one
 * shared phase reads as a single current moving down through the whole
 * diagram rather than every segment pulsing in lockstep.
 */
export function useFlowGroup(enabled: boolean) {
  return useCallback(
    (node: SVGGElement | null) => {
      if (!node || !enabled) return;

      const paths = Array.from(node.querySelectorAll("path"));
      const stage = Number(node.dataset.flowStage ?? 0);
      const lags = paths.map((path) => Number(path.dataset.flowLag ?? 0));

      return subscribe((current, level) => {
        for (let i = 0; i < paths.length; i++) {
          paths[i].style.strokeDashoffset = String(-(current + stage + lags[i]));
        }
        // The channel keeps its liquid at rest; scrolling only brightens it.
        node.style.opacity = String(0.6 + 0.4 * level);
      });
    },
    [enabled],
  );
}

/**
 * The mobile counterpart: the same current, travelling down the single
 * vertical rail. Moves a `background-position` rather than a dash offset,
 * since the rail is one 2px element and not a path.
 */
export function useFlowRail(enabled: boolean) {
  return useCallback(
    (node: HTMLElement | null) => {
      if (!node || !enabled) return;

      return subscribe((current, level) => {
        node.style.backgroundPositionY = `${current}%`;
        node.style.opacity = String(0.55 + 0.45 * level);
      });
    },
    [enabled],
  );
}
