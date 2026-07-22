import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Site-wide easing curve, per brand spec. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Ambient/looping motion (idle sweeps, glow pulses) uses this instead of
 * EASE — an ease-in/out curve stutters when repeated infinitely. */
export const EASE_AMBIENT_CSS = "linear";

/**
 * Canonical duration scale — single source of truth for every animation
 * duration on the site. Values are the real numbers already shipping in
 * Reveal/PageReveal/RouteTransition, named here rather than changed —
 * `micro`/`quick` are reserved for future click-feedback/hover work and
 * aren't consumed anywhere yet.
 */
export const DURATIONS = {
  /** Press/tap feedback. Not yet consumed anywhere. */
  micro: 0.15,
  /** Hover / small UI-state changes. Not yet consumed anywhere. */
  quick: 0.3,
  /** Standard content reveal — Reveal.tsx / RevealItem. */
  standard: 0.7,
  /** Route-change wipe — RouteTransition.tsx. */
  transition: 0.55,
  /** Large one-time cinematic reveal — PageReveal.tsx's load-in.
   * Runs slightly above the Motion Bible's nominal 0.85–1.0s ritual band;
   * left as-is here (foundation phase changes no visual timing) and
   * flagged for a deliberate decision in a later phase. */
  ritual: 1.1,
} as const;
