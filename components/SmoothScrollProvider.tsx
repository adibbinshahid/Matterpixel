"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type Lenis from "lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { loadGsap, refreshScrollTrigger } from "@/lib/loadGsap";

/**
 * Module-level singleton so components outside this provider (e.g. a
 * ScrollTrigger's `onScrubComplete` wanting to snap) can drive Lenis
 * directly via `lenis.scrollTo()` instead of setting `window.scrollY`
 * themselves — Lenis owns the actual scroll position each rAF tick, so
 * anything that sets scroll position without going through Lenis gets
 * silently overwritten on the next tick.
 */
let activeLenis: Lenis | null = null;
export function getLenis() {
  return activeLenis;
}

/**
 * Wires Lenis smooth-scroll into GSAP's ticker so ScrollTrigger stays in
 * sync with Lenis's virtual scroll position. Skipped entirely under
 * prefers-reduced-motion — native scroll takes over instead.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    // lenis is not needed for first paint or first input, so it's
    // code-split out of the initial bundle and only fetched + initialized
    // once the main thread is idle — keeps it off the critical path that
    // TBT/LCP are measured against. gsap/ScrollTrigger load the same way
    // via loadGsap (shared with Hero/ServicesFold).
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const init = async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()]);
      if (cancelled) return;

      const lenis = new Lenis({
        duration: 0.6,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        wheelMultiplier: 1.2,
      });
      lenisRef.current = lenis;
      activeLenis = lenis;
      document.documentElement.classList.add("lenis");

      lenis.on("scroll", ScrollTrigger.update);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      // Web font swap (this site's `next/font` uses `display: "swap"`)
      // reflows text height everywhere on the page, which can shift
      // ScrollTrigger positions that were computed before fonts settled.
      // Force one refresh right after, before anyone can be mid-interaction
      // with a scroll-triggered section yet.
      document.fonts?.ready.then(() => refreshScrollTrigger());

      // Pinned sections (services carousel, process stepper) compute their
      // scroll distance from layout measured at a point in time — a
      // backgrounded tab or a bfcache restore (`pageshow` with `persisted`)
      // can leave those measurements stale, which reads as "the pinned
      // section vanished." A refresh on regaining visibility is cheap
      // insurance against that class of bug.
      const onVisible = () => {
        if (document.visibilityState === "visible") refreshScrollTrigger();
      };
      const onPageShow = (e: PageTransitionEvent) => {
        if (e.persisted) refreshScrollTrigger();
      };
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("pageshow", onPageShow);

      cleanup = () => {
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("pageshow", onPageShow);
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
        activeLenis = null;
        document.documentElement.classList.remove("lenis");
      };
    };

    const ric = window.requestIdleCallback ?? ((fn: IdleRequestCallback) => setTimeout(() => fn({} as IdleDeadline), 1));
    const cic = window.cancelIdleCallback ?? clearTimeout;
    const handle = ric(() => void init());

    return () => {
      cancelled = true;
      cic(handle);
      cleanup?.();
    };
  }, [reduced]);

  return <>{children}</>;
}
