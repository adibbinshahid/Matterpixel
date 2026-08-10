"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import { processMethod } from "@/content/servicesPage";
import { servicesIntro } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The process, rebuilt as a system you move *through* rather than a stepper
 * you watch cycle.
 *
 * The homepage keeps components/Process.tsx — a fixed-height, auto-advancing
 * tab panel describing the engagement meeting-by-meeting. This is the same
 * five beats at a higher altitude (method, not calendar), and it is driven
 * entirely by scroll position: there is no timer, no autoplay, and no
 * clicking. Where you are in the section *is* the active step.
 *
 * Retains the brand's blue full-bleed panel, so it still reads as the same
 * section of the site it always was.
 *
 * Structure on desktop: a sticky left rail carrying the active step's giant
 * numeral and title, against a right column of steps that scroll past it.
 * A vertical connector line runs the height of the right column and fills
 * with scroll progress — the literal "moving through the system" read.
 *
 * Reduced motion: every step renders in its resting active state, the
 * connector is drawn full, and no scroll listener is attached.
 */
export function ProcessSystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  /** Live height of the sticky rail, used to centre it against the viewport.
   * Tracked rather than hard-coded because the rail's height changes with the
   * active step's copy and with the fluid `clamp()` numeral. */
  const [railHeight, setRailHeight] = useState(0);

  // Progress along the steps column specifically (not the whole section) —
  // so the connector is full exactly when the last step is reached, rather
  // than at some arbitrary point determined by the heading's height.
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 65%", "end 75%"],
  });
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Active step is whichever one is nearest the viewport's focus line.
  // IntersectionObserver with a narrow band rather than a scroll handler:
  // it fires only on threshold crossings, so idle scrolling costs nothing.
  useEffect(() => {
    if (reduced) return;
    const list = stepsRef.current;
    if (!list) return;

    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-step-index]"));
    if (!items.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.stepIndex);
          if (!Number.isNaN(idx)) setActiveIndex(idx);
        }
      },
      // A band across the upper-middle of the viewport: a step becomes
      // active as it reaches reading position, not as it first appears.
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 },
    );

    for (const item of items) io.observe(item);
    return () => io.disconnect();
  }, [reduced]);

  // Keep the centring offset honest as the rail's content changes height.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setRailHeight(entry.contentRect.height),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const active = processMethod.steps[activeIndex];

  return (
    // No `overflow-hidden` here, deliberately: an overflow-hidden ancestor
    // silently breaks `position: sticky` on the rail below, which is the
    // whole mechanism pinning the active step through the list. Nothing in
    // this section bleeds past its bounds, so the clip isn't needed.
    <section ref={sectionRef} className="panel-blue relative border-t border-line">
      <div className="section-shell py-24 lg:py-32">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            {/* .label-eyebrow hardcodes var(--blue) — invisible on a blue
                panel, so it takes an explicit override here. Same handling
                as components/Process.tsx. */}
            <p className="label-eyebrow mb-4" style={{ fontSize: "1.5rem", color: "#fff" }}>
              {processMethod.eyebrow}
            </p>
            <h2>
              <GiantHeading
                lines={[processMethod.heading]}
                sizeRef={servicesIntro.headingLines}
              />
            </h2>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-12 lg:mt-28 lg:grid-cols-12 lg:gap-16">
          {/* ── Sticky rail: the currently-active step, oversized ──────
              Desktop only. Without a sticky viewport to pin against, the
              rail on mobile would just be a second, out-of-sync copy of
              whichever step happened to be active — so mobile drops it and
              each step carries its own detail inline instead (see the
              `lg:hidden` blocks in the list below). */}
          <div className="hidden lg:col-span-5 lg:block">
            {/* Vertically centred pin. `position: sticky` can only pin to an
                edge, never to the middle, so the rail is stuck to the top at
                an offset of half a viewport minus half its own height — which
                lands its centre exactly on the screen's centre.

                Two approaches were rejected first. `top: 50%` with a -50%
                transform centres correctly but releases wrong: sticky derives
                its release point from the untransformed box, so the rail
                visually overruns the bottom of the section. Wrapping it in a
                100vh flex-centre box releases correctly, but a 100vh box eats
                the container's height budget — the pinned scroll range is
                `container - box`, so a full-viewport box cut the pin to under
                half the list.

                Measuring the rail keeps both properties: the box stays its own
                small height (long pin range) while sitting dead centre.
                `railHeight` is 0 until the effect runs, so the offset falls
                back to plain `top: 50vh` for one paint rather than jumping. */}
            <div
              className="lg:sticky"
              style={{ top: `calc(50vh - ${railHeight / 2}px)` }}
            >
              <div ref={railRef}>
              {/* Numeral swaps by replacement rather than counting or
                  cross-fading — the step doesn't transition, it's swapped,
                  which is how a readout behaves. The outgoing value drops
                  out of a fixed mask as the incoming one rises into it.
                  Transform + opacity rather than an animated clip-path:
                  clip-path isn't compositor-accelerated, and it's the same
                  property whose `whileInView` variant elsewhere on this
                  page failed to fire at all. */}
              <div className="relative h-[clamp(4rem,10vw,8rem)] overflow-hidden">
                {processMethod.steps.map((s, i) => (
                  <motion.span
                    key={s.id}
                    aria-hidden="true"
                    className="absolute inset-0 text-[clamp(4rem,10vw,8rem)] font-extrabold leading-[0.8] tracking-[-0.05em] text-white"
                    initial={false}
                    animate={
                      reduced
                        ? { opacity: i === activeIndex ? 1 : 0, y: "0%" }
                        : {
                            opacity: i === activeIndex ? 1 : 0,
                            y: i === activeIndex ? "0%" : "45%",
                          }
                    }
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {s.id}
                  </motion.span>
                ))}
              </div>

              <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-4"
              >
                <p className="text-[clamp(1.75rem,3.4vw,2.75rem)] font-extrabold uppercase leading-none tracking-tight text-white">
                  {active.title}
                </p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
                  {active.detail}
                </p>
                <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/50">
                  output — {active.output}
                </p>
              </motion.div>

              {/* Step position readout, in the same annotation register the
                  rest of the page uses. */}
              <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.16em] text-white/40">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(processMethod.steps.length).padStart(2, "0")}
              </p>
              </div>
            </div>
          </div>

          {/* ── Scrolling steps + connector ──────────────────────────── */}
          {/* Bottom padding on the column, not the list: `position: sticky`
              releases the moment the rail's bottom edge meets the bottom of
              its containing block, and without this the rail unpinned at
              exactly the point step 05 became active. The extra height keeps
              the pin alive until the last step has been scrolled through.
              It sits outside the connector's wrapper below so the line still
              stops at the final node instead of trailing past it. */}
          <div className="lg:col-span-7 lg:pb-[32vh]">
            <div className="relative">
            {/* Connector: a static track with a scroll-driven fill on top.
                transform-only (scaleY), so it never triggers layout. */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-[7px] top-0 w-px bg-white/20"
            >
              <motion.div
                className="h-full w-full origin-top bg-magenta"
                style={reduced ? { scaleY: 1 } : { scaleY: fillScale }}
              />
            </div>

            <ol ref={stepsRef} className="flex flex-col">
              {processMethod.steps.map((s, i) => {
                const isActive = reduced || i === activeIndex;
                return (
                  <li
                    key={s.id}
                    data-step-index={i}
                    // Uniform padding (no `first:pt-0`): the node's absolute
                    // offset is tuned to this padding, and shortening the
                    // first item would slide its node off the title line.
                    className="relative py-10 pl-12 lg:py-14"
                  >
                    {/* Node on the connector — a pixel, not a circle. Fills
                        magenta and grows once its step is the active one. */}
                    <motion.span
                      aria-hidden="true"
                      className="absolute left-0 top-[3.25rem] block h-[15px] w-[15px] lg:top-[4.25rem]"
                      animate={{
                        backgroundColor: isActive ? "var(--magenta)" : "rgba(255,255,255,0.3)",
                        scale: isActive ? 1 : 0.6,
                      }}
                      transition={{ duration: 0.4, ease: EASE }}
                    />

                    <motion.div
                      animate={{ opacity: isActive ? 1 : 0.4 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-white/50">
                          {s.id}
                        </span>
                        <h3 className="text-[clamp(1.5rem,3vw,2.25rem)] font-extrabold uppercase leading-none tracking-tight text-white">
                          {s.title}
                        </h3>
                      </div>
                      <p className="mt-4 max-w-lg text-lg leading-snug text-white/85 sm:text-xl">
                        {s.desc}
                      </p>
                      {/* On mobile the sticky rail is stacked far above, so
                          each step carries its own detail and output. Hidden
                          on desktop where the rail already shows them. */}
                      <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 lg:hidden">
                        {s.detail}
                      </p>
                      <p className="mt-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-white/45 lg:hidden">
                        output — {s.output}
                      </p>
                    </motion.div>
                  </li>
                );
              })}
            </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
