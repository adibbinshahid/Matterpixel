"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { getLenis } from "@/lib/lenisInstance";

/**
 * Full-height "we're global" slide at the top of /contact — a looping
 * globe video, headline centered above it. Once the user starts
 * scrolling down past it, we retarget the site's existing Lenis
 * smooth-scroll to glide straight into the contact section below (an
 * eased "sweet" transition, not an instant native scroll-snap jump).
 * Only engages once per visit to the zone and never on the way back up.
 */
export function GlobeHero() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => {});
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const target = section?.nextElementSibling as HTMLElement | null;
    if (!section || !target) return;

    let triggered = false;
    let cleanupScroll: (() => void) | undefined;
    let raf = 0;

    function onScroll() {
      const lenis = getLenis();
      if (!lenis) return;
      const scroll = lenis.scroll;
      const sectionHeight = section!.offsetHeight;
      if (!triggered && scroll > 60 && scroll < sectionHeight - 40) {
        triggered = true;
        lenis.scrollTo(target!, {
          duration: 1.3,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      } else if (scroll < 20) {
        triggered = false;
      }
    }

    // SmoothScrollProvider (an ancestor) creates the Lenis instance in its
    // own effect, which fires AFTER this one (React runs child effects
    // before parent effects) — so poll briefly until it's actually ready.
    function waitForLenis() {
      const lenis = getLenis();
      if (lenis) {
        lenis.on("scroll", onScroll);
        cleanupScroll = () => lenis.off("scroll", onScroll);
      } else {
        raf = requestAnimationFrame(waitForLenis);
      }
    }
    waitForLenis();

    return () => {
      cancelAnimationFrame(raf);
      cleanupScroll?.();
    };
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#03060d] text-center"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/globe-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <div className="relative z-10 px-6">
        <p
          className="label-eyebrow !text-[clamp(0.8rem,2.2vw,1.25rem)] !text-paper/60"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7), 0 0 4px rgba(0,0,0,0.5)" }}
        >
          Currently Based on Dhaka, Bangladesh
        </p>
        <h2
          className="mt-3 text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-paper"
          style={{ textShadow: "0 4px 24px rgba(0,0,0,0.7), 0 0 6px rgba(0,0,0,0.5)" }}
        >
          Building Globally, Everywhere!
        </h2>
      </div>
    </section>
  );
}
