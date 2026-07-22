"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { hero, trust } from "@/content/siteConfig";
import { WEB_STACK } from "@/components/TechMarquee";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DURATIONS, EASE } from "@/lib/utils";

/**
 * Text Reveal System (see Reveal.tsx) — the same blur-to-sharp + upward-
 * settle recipe and shared duration/easing constants, staggered across the
 * manifesto's own lines rather than scroll-triggered: Hero is already in
 * view at first paint, so a plain mount animation is the right trigger
 * here, not `whileInView`.
 */
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATIONS.standard, ease: EASE },
  },
};

/** Headline lines reveal with a clip-path wipe (same technique as
 * RouteTransition's route wipe) instead of the blur/translate every other
 * line uses — the manifesto's two lines are the one moment on the page
 * that should read as "unveiled," not "faded in." */
const line: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: DURATIONS.standard, ease: EASE } },
};

export function Hero() {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Slow scroll-scrubbed Ken Burns drift on the video — same scrub recipe as
  // WorkGrid's media parallax (fromTo, scrub: true, ease: "none"), here on
  // scale instead of position so the loop reads as a slow push-in rather
  // than a pan.
  useEffect(() => {
    if (reduced || !videoRef.current) return;
    const tween = gsap.fromTo(
      videoRef.current,
      // Starts at 1.05, not 1 — matches the Tailwind `scale-105` fallback
      // (reduced-motion never runs this effect, so that class is what
      // renders instead) and gives the blur filter a hair of overscan so
      // its edge-softening never peeks past the section's clipped bounds.
      { scale: 1.05 },
      {
        scale: 1.12,
        ease: "none",
        scrollTrigger: { trigger: videoRef.current, start: "top top", end: "bottom top", scrub: true },
      },
    );
    ScrollTrigger.refresh();
    return () => {
      tween.scrollTrigger?.kill();
    };
  }, [reduced]);

  // Autoplaying a moving video is exactly what prefers-reduced-motion asks
  // sites to avoid — the muted <video> still renders (so the hero keeps its
  // background), it just holds on the first frame instead of looping.
  useEffect(() => {
    if (!reduced || !videoRef.current) return;
    videoRef.current.pause();
  }, [reduced]);

  return (
    <section
      id="hero"
      data-nav-scrim="light"
      className="panel-dark relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover opacity-40"
        >
          <source src="/videos/HeroBG1.mp4" type="video/mp4" />
        </video>
        {/* Contrast scrim — guarantees the white/light headline stays
            legible regardless of the footage's own brightness at any
            given frame. */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b0b0d]/90 via-[#0b0b0d]/55 to-[#0b0b0d]/20"
          aria-hidden="true"
        />
      </div>

      {/* Section itself is min-h-[100svh] + flex items-center (above) so the
         video background always covers exactly the full viewport height on
         any screen, with this content block vertically centered inside it —
         instead of the section's height being purely a function of its own
         content/fixed rem padding. py-28 is breathing room, not sizing. */}
      <div className="section-shell relative w-full py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          <motion.p
            variants={item}
            className="mb-6 inline-flex flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap rounded-full bg-blue px-4 py-2 shadow-[var(--shadow-lifted)]"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" aria-hidden="true" />
            {hero.eyebrow.split(" · ").map((phrase) => (
              <span key={phrase} className="inline-flex shrink-0 items-center gap-1.5">
                <span className="text-[0.9375rem] font-extrabold uppercase tracking-[0.06em] text-white">
                  {phrase}
                </span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" aria-hidden="true" />
              </span>
            ))}
          </motion.p>

          <h1 className="text-hero-headline lowercase overflow-hidden text-ink">
            <motion.span variants={line} className="block overflow-hidden">
              We <span className="text-blue">build</span> what matters.
            </motion.span>
            <motion.span variants={line} className="block overflow-hidden">
              Down to the <span className="text-magenta">pixel</span>.
            </motion.span>
          </h1>

          <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            {hero.sub}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/contact#email" data-nav-cta-anchor className="btn-primary group">
              {hero.ctaPrimary}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <Link href="/projects" className="btn-outline group">
              View Projects
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Static tech-stack row — same icon set as Trust's TechMarquee,
             but here it's a fixed one-of-each strip (no scroll, no
             duplicated loop-copy) since the hero column is too narrow for
             a marquee to read as anything but cramped. All 13 fit this
             column's own width (max-w-3xl, inherited from the parent) on
             one line at any desktop size; `flex-wrap` is just the safety
             fallback for genuinely narrow (mobile) viewports. */}
          <motion.div
            variants={item}
            className="mt-14 flex w-full flex-wrap items-center justify-center gap-6 border-t border-line pt-6"
          >
            {WEB_STACK.map(({ name, Icon }) => (
              <Icon
                key={name}
                title={name}
                className="h-6 w-6 shrink-0 grayscale"
                style={{ color: "var(--ink-soft)", opacity: 0.5 }}
              />
            ))}
          </motion.div>

          {/* Credentials — same badges as Trust.tsx (content/siteConfig's
             trust.badges), reused rather than re-declared. */}
          <motion.div variants={item} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {trust.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center whitespace-nowrap rounded-full border border-line bg-paper-2 px-4 py-2 text-sm font-semibold text-ink-soft"
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
