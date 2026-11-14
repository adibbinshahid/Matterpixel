"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, ChevronDown, Gauge, Star, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { hero, trust, BOOKING_URL } from "@/content/siteConfig";
import { WEB_STACK } from "@/components/TechMarquee";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { loadGsap, refreshScrollTrigger } from "@/lib/loadGsap";

/**
 * Text Reveal System (see Reveal.tsx) — the same blur-to-sharp + upward-
 * settle recipe, but authored in CSS (`.hero-rise` / `.hero-line` in
 * globals.css) rather than as framer-motion variants, and staggered via
 * animation-delay instead of `staggerChildren`.
 *
 * Everything in this hero is above the fold, so a mount animation is the
 * right trigger — but a JS-driven one leaves all of it at opacity:0 in the
 * server HTML until hydration runs. That made the subheadline the LCP
 * element with ~2.4s of pure render delay on a mid-range phone. CSS starts
 * the same motion off the browser's paint clock, so the text is on screen
 * immediately and the animation is decoration rather than a gate.
 */

const TRUST_BADGE_ICONS: Record<string, LucideIcon> = {
  "90+ Google PageSpeed Score": Gauge,
  "Fiverr Top Rated Seller": Star,
  "NDA Friendly": ShieldCheck,
  "No Surprise Budget Increase": Wallet,
};
/**
 * Homepage hero: one centred poster over the full-screen background clip —
 * eyebrow pill, three-line headline, subline, actions, stack and trust
 * badges, and the scroll cue at the foot of the first screen.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Slow scroll-scrubbed push-in on the background clip.
  useEffect(() => {
    if (reduced || !videoRef.current) return;
    let cancelled = false;
    let tween: gsap.core.Tween | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !videoRef.current) return;
      tween = gsap.fromTo(
        videoRef.current,
        { scale: 1.05 },
        {
          scale: 1.12,
          ease: "none",
          scrollTrigger: { trigger: videoRef.current, start: "top top", end: "bottom top", scrub: true },
        },
      );
      refreshScrollTrigger();
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
    };
  }, [reduced]);

  // The clip is loaded by script, never by the HTML: on a phone its 1.4MB
  // first frame was the page's largest paint and put mobile LCP at 6–7s, so
  // phones keep the poster (a 6KB still of frame 0), and wider screens only
  // fetch the clip once the page is idle. Reduced motion keeps the poster
  // everywhere: a moving background is exactly what it asks us to avoid.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced || !window.matchMedia("(min-width: 768px)").matches) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      video.src = "/videos/HeroBG1.mp4";
      video.play().catch(() => undefined);
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);
    return () => {
      done = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, [reduced]);

  return (
    <section id="hero" data-nav-scrim="light" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          poster="/videos/HeroBG1-poster.webp"
          preload="none"
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover opacity-70"
        />
        {/* Centred scrim: darkest behind the copy, opening toward the
            edges, then fading to the page ground at the foot. */}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(10,11,16,0.78)_0%,rgba(10,11,16,0.45)_70%,rgba(10,11,16,0.3)_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(0deg,#0b0c0e_15%,transparent)]"
          aria-hidden="true"
        />
      </div>

      {/* Centred poster: the offer, the actions and the proof stack on one
          axis and fill the first screen, with the scroll cue at its foot. */}
      <div className="home-shell flex min-h-[100svh] flex-col items-center justify-center pb-6 pt-28 text-center sm:pt-28">
        <p
          className="hero-rise inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xl sm:px-5 sm:py-2.5 sm:text-sm"
        >
          {/* A marker leads every item, so a wrapped line never opens on an
              orphaned separator. */}
          {hero.eyebrow.split(" · ").map((phrase) => (
            <span key={phrase} className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-magenta" aria-hidden="true" />
              {phrase}
            </span>
          ))}
        </p>

        {/* Three lines, the middle one — what we build — set largest. */}
        <h1 className="mt-6 text-balance text-[clamp(1.75rem,0.9rem+2.6vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-white">
          <HeroLine delay="0.1s">
            We <span className="text-blue">build</span>
          </HeroLine>
          <HeroLine delay="0.16s">
            <span className="block text-[clamp(2.4rem,0.6rem+6.2vw,6.25rem)] leading-[1]">
              websites and AI systems
            </span>
          </HeroLine>
          <HeroLine delay="0.22s">
            that <span className="text-magenta">win</span> customers and <span className="text-magenta">save</span> hours.
          </HeroLine>
        </h1>

        <p
          className="hero-rise mt-6 max-w-[40rem] text-base leading-relaxed text-white/75 sm:text-lg"
          style={{ animationDelay: "0.3s" }}
        >
          {hero.sub}
        </p>

        <div
          className="hero-rise mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          style={{ animationDelay: "0.4s" }}
        >
          <Link href={BOOKING_URL} className="btn-brand group">
            {hero.ctaPrimary}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link href="/projects" className="btn-outline group">
            View Projects
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* The stack, monochrome and small, over a hairline. */}
        <div
          className="hero-rise mt-10 flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-white/10 pt-6"
          style={{ animationDelay: "0.5s" }}
          aria-label="Built with"
          role="img"
        >
          {WEB_STACK.map(({ name, Icon }) => (
            <Icon key={name} title={name} className="h-5 w-5 shrink-0 text-white/40" />
          ))}
        </div>

        <ul
          className="hero-rise mt-6 flex flex-wrap justify-center gap-2"
          style={{ animationDelay: "0.6s" }}
          aria-label="Standards"
        >
          {trust.badges.map((badge) => {
            const Icon = TRUST_BADGE_ICONS[badge] ?? ShieldCheck;
            return (
              <li
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-[0.8125rem] font-medium text-white/80 backdrop-blur-md"
              >
                <Icon className="h-3.5 w-3.5 text-[var(--blue-ink)]" aria-hidden="true" />
                {badge}
              </li>
            );
          })}
        </ul>

        {/* Scroll cue: a slow breathing chevron, purely a hint. */}
        <div
          className="hero-rise mt-8 flex flex-col items-center gap-2 text-white/50"
          style={{ animationDelay: "0.7s" }}
          aria-hidden="true"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]">Scroll to explore</span>
          <span className="hero-cue">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </div>

    </section>
  );
}

/** One wiped-in half of the headline (CSS clip-path wipe, `.hero-line`). */
function HeroLine({ children, delay }: { children: ReactNode; delay: string }) {
  return (
    <span className="hero-line block" style={{ animationDelay: delay }}>
      {children}
    </span>
  );
}
