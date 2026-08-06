"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ArrowRight, ChevronDown } from "lucide-react";
import { hero, trust } from "@/content/siteConfig";
import { WEB_STACK } from "@/components/TechMarquee";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DURATIONS, EASE } from "@/lib/utils";
import { setHeroVideo } from "@/lib/heroVideoRef";

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

  // Registers this element so Stats' top-seam bleed can mirror its live
  // frame via canvas instead of running a second, inevitably out-of-sync
  // <video> loop of the same clip (see lib/heroVideoRef.ts).
  useEffect(() => {
    setHeroVideo(videoRef.current);
    return () => setHeroVideo(null);
  }, []);

  return (
    <section
      id="hero"
      data-nav-scrim="light"
      className="panel-dark relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* bg-[#0b0b0d] here — not just on the scrim below — so a device
         that fails to autoplay/load the video (weak connection,
         data-saver, autoplay blocked) still gets the section's intended
         dark backdrop instead of falling through to the page's light
         `bg-paper`, which read as a broken/blank hero. */}
      <div className="absolute inset-0 -z-10 bg-[#0b0b0d]">
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
      <div className="section-shell relative w-full py-16 sm:py-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
          className="mx-auto flex max-w-5xl flex-col items-center text-center"
        >
          {/* Flat translucent label, not glass-button styling — no
             border, no shadow, no specular sheen (dropped `.nav-glass`
             and its ::before/::after highlight pseudo-elements). The
             CTA buttons below use that exact same rounded-full + border +
             layered-shadow language, so this eyebrow badge was reading as
             a third, non-functional button sitting above them rather
             than a plain kicker label. Backdrop-blur + a soft translucent
             fill are enough to keep it feeling like glass without the
             depth cues that imply "press me". */}
          {/* Single static line at every width, no scroll/marquee — font
             size below `sm` is `vw`-driven (not a fixed rem step) so it
             scales down continuously with the viewport instead of
             wrapping or overflowing on narrower phones. */}
          <motion.p
            variants={item}
            className="relative mb-4 flex max-w-full flex-nowrap items-center justify-center gap-x-0.5 whitespace-nowrap rounded-full px-2 py-1.5 backdrop-blur-xl backdrop-saturate-150 sm:mb-6 sm:gap-x-1.5 sm:px-4 sm:py-2.5"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" aria-hidden="true" />
            {hero.eyebrow.split(" · ").map((phrase) => (
              <span key={phrase} className="inline-flex shrink-0 items-center gap-1 sm:gap-1.5">
                <span
                  className="text-[1.55vw] font-extrabold uppercase tracking-[0.01em] text-white sm:text-[0.9375rem] sm:tracking-[0.06em]"
                  style={{ textShadow: "0 1px 6px rgba(0,0,0,0.45)" }}
                >
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

          {/* Same wording as hero.sub (content/siteConfig) — hardcoded here
             rather than rendering the field directly, same as the headline
             above, so the line break can be placed deliberately at sm+
             instead of wherever the container width happens to wrap it.
             max-w-2xl (up from xl) so each half fits on its own line
             instead of wrapping again within the forced break. */}
          <motion.p variants={item} className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:mt-6 sm:text-lg">
            From premium websites and AI automation to content creation and digital growth,
            <br className="hidden sm:block" /> we craft digital experiences that people trust, remember and choose.
          </motion.p>

          <motion.div variants={item} className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
            <Link href="/contact?tab=booking" className="btn-primary group">
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
             one line at any desktop size; below `sm` the icons/gaps shrink
             instead of wrapping so all 13 still fit one line on a phone. */}
          <motion.div
            variants={item}
            className="mt-10 flex w-full flex-nowrap items-center justify-center gap-0.5 border-t border-line pt-6 sm:mt-14 sm:gap-6"
          >
            {WEB_STACK.map(({ name, Icon }) => (
              <Icon
                key={name}
                title={name}
                className="h-3 w-3 shrink-0 grayscale sm:h-6 sm:w-6"
                style={{ color: "var(--ink-soft)", opacity: 0.5 }}
              />
            ))}
          </motion.div>

          {/* Credentials — same badges as Trust.tsx (content/siteConfig's
             trust.badges), reused rather than re-declared. flex-nowrap +
             shrunk text/padding below `sm` so all four badges hold to one
             line on a phone instead of wrapping. */}
          <motion.div variants={item} className="mt-6 flex flex-nowrap items-center justify-center gap-1 sm:gap-3">
            {trust.badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-paper-2 px-1 py-1 text-[0.34rem] font-semibold text-ink-soft sm:px-4 sm:py-2 sm:text-sm"
              >
                {badge}
              </span>
            ))}
          </motion.div>

          {/* Scroll cue — mirrored yoyo (not a 3-keyframe loop resetting
             abruptly at each cycle) so the chevron eases down and back up
             smoothly both directions, read as a slow breathing motion
             rather than a bounce. Purely a visual hint, not a link/button
             — nothing to click, so no interactive semantics needed. */}
          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center gap-2 text-white/50"
            aria-hidden="true"
          >
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 7], opacity: [0.35, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
