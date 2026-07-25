"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

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

    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => 1 - Math.pow(1 - t, 4),
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
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      activeLenis = null;
      document.documentElement.classList.remove("lenis");
    };
  }, [reduced]);

  return <>{children}</>;
}
