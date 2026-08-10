"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import { servicesIntro } from "@/content/siteConfig";
import { processMethod } from "@/content/servicesPage";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE } from "@/lib/utils";

const AUTO_ADVANCE_MS = 2500;
const CLICK_PAUSE_MS = 15000;

const total = processMethod.steps.length;

/**
 * Scattered giant step numerals drifting slowly behind the section — the
 * same "01 02 03 04 05" the stepper below makes prominent, doing double
 * duty as this section's background instead of a second, unrelated motif.
 * Fixed px `top` (not %) so it doesn't visually reflow when the panel
 * below changes height on step-switch; `left` as % is safe since the
 * section's width doesn't change. Reduced-motion strips the drift via the
 * global animation kill-switch in globals.css (plain CSS `animation`, not
 * JS-driven, so no separate handling needed here).
 */
const GHOST_POSITIONS: { top: string; left: string; rotate: number }[] = [
  { top: "-60px", left: "4%", rotate: -8 },
  { top: "50px", left: "27%", rotate: 6 },
  { top: "-90px", left: "50%", rotate: -5 },
  { top: "60px", left: "74%", rotate: 8 },
  { top: "-50px", left: "97%", rotate: -10 },
];

function ProcessGhostNumbers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {processMethod.steps.map((s, i) => {
        const pos = GHOST_POSITIONS[i % GHOST_POSITIONS.length];
        return (
          <div
            key={s.id}
            className="absolute select-none font-black leading-none text-ink/[0.1]"
            style={{ top: pos.top, left: pos.left, fontSize: "20rem", transform: `translateX(-50%) rotate(${pos.rotate}deg)` }}
          >
            <span
              className="process-ghost-num block"
              style={{ animationDelay: `${i * -0.67}s`, animationDuration: `${(12 + i * 2) / 3}s` }}
            >
              {s.id}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Auto-advancing (1s/step) as well as click-driven — still not a
 * scroll-triggered stepper, the whole point is a fixed-height
 * single-screen block regardless of how much copy any one step carries,
 * since only one step's panel is ever mounted at a time.
 *
 * Auto-advance only ticks while the section is on screen (IntersectionObserver
 * below) — it holds in place off-screen rather than cycling somewhere
 * unseen, and resets to step 01 on every re-entry rather than resuming
 * wherever it was. Within that, clicking a step doesn't stop the interval,
 * just tells it to *skip* ticks for the next `CLICK_PAUSE_MS` via a
 * timestamp ref (`pausedUntilRef`) — cheaper than tearing down/recreating
 * the interval on every click, and it means resuming naturally continues
 * forward from whatever step the user clicked, with no separate "resume
 * position" to track.
 *
 * Three animation layers work together on every step change, none of them
 * a generic opacity/translate fade:
 *  1. The rail's fill bar grows/shrinks to the new node (a real progress
 *     indicator, not decoration — it's *why* the site's brand line motif
 *     belongs here).
 *  2. The active step's numeral scales up and its underline is a
 *     shared-layout element (`layoutId`) that physically slides from the
 *     old step to the new one, rather than one fading out while another
 *     fades in.
 *  3. The panel itself clip-path wipes out/in (AnimatePresence,
 *     `mode="wait"`); its contents are keyed to the same step and get a
 *     quick fade+rise rather than a slower dissolve — at a 1s auto-advance
 *     cadence there isn't room for a leisurely reveal.
 */
export function Process() {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const step = processMethod.steps[activeIndex];
  const fillPercent = total > 1 ? (activeIndex / (total - 1)) * 100 : 0;
  const pausedUntilRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Auto-advance only runs while the section is actually on screen — off-
  // screen, it holds in place rather than silently cycling somewhere the
  // visitor can't see; scrolling back into view resets to step 01 and
  // restarts, rather than resuming wherever it happened to be. threshold
  // 0.3 (not "any pixel") so it doesn't flip on a sliver at the very edge
  // of the viewport.
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let intervalId = 0;

    function startInterval() {
      window.clearInterval(intervalId);
      intervalId = window.setInterval(() => {
        if (Date.now() < pausedUntilRef.current) return;
        setActiveIndex((prev) => (prev + 1) % total);
      }, AUTO_ADVANCE_MS);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          pausedUntilRef.current = 0;
          setActiveIndex(0);
          startInterval();
        } else {
          window.clearInterval(intervalId);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      window.clearInterval(intervalId);
    };
  }, [reduced]);

  function selectStep(i: number) {
    setActiveIndex(i);
    pausedUntilRef.current = Date.now() + CLICK_PAUSE_MS;
  }

  return (
    <section ref={sectionRef} className="relative panel-blue border-t border-line">
      <ProcessGhostNumbers />
      <div className="relative section-shell py-20 sm:py-24 lg:py-32">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            {/* .label-eyebrow hardcodes color: var(--blue) itself — the
               section's own token reassignment (panel-blue) only touches
               --ink/--ink-soft/etc, so this needs an explicit override or
               it's blue eyebrow text on a blue background. */}
            <p className="label-eyebrow mb-4" style={{ fontSize: "1.5rem", color: "#fff" }}>
              {processMethod.eyebrow}
            </p>
            <h2>
              <GiantHeading lines={[processMethod.heading]} sizeRef={servicesIntro.headingLines} />
            </h2>
          </div>
        </Reveal>

        {/* Progress rail — a plain thick bar above the numeral row, not
           threaded through each marker's center like the old small-circle
           version needed; decoupling the two means the numerals below can
           be as big as they want without fighting the rail's alignment. */}
        <div className="relative mt-10 h-3 px-5">
          <div className="h-3 rounded-full bg-white/20" aria-hidden="true" />
          <motion.div
            className="absolute inset-y-0 left-5 rounded-full bg-magenta"
            initial={false}
            animate={{ width: `${fillPercent}%` }}
            transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE }}
            style={{ maxWidth: "calc(100% - 2.5rem)" }}
            aria-hidden="true"
          />
        </div>

        {/* Numeral row — the step numbers *are* the primary UI here, not
           a label under a small marker, per "more prominent Step 01,
           02..." feedback on the previous circle-based version. */}
        <div className="relative mt-6 flex justify-between px-5" role="tablist" aria-label="Project process steps">
          {processMethod.steps.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`process-panel-${s.id}`}
                id={`process-tab-${s.id}`}
                onClick={() => selectStep(i)}
                className="group relative flex flex-col items-center gap-1 outline-none"
              >
                <span
                  className={`text-[0.6rem] font-semibold uppercase tracking-[0.15em] transition-colors duration-300 ${
                    isActive ? "text-white/80" : "text-ink-soft/50 group-hover:text-ink-soft"
                  }`}
                >
                  Step
                </span>
                <motion.span
                  animate={{ scale: isActive ? 1 : 0.7, opacity: isActive ? 1 : 0.4 }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
                  className={`text-4xl font-extrabold leading-none tracking-tight transition-colors duration-300 sm:text-5xl lg:text-6xl ${
                    isActive ? "text-magenta" : "text-ink-soft group-hover:text-ink"
                  }`}
                >
                  {s.id}
                </motion.span>
                <span
                  className={`mt-1 hidden text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-300 sm:block ${
                    isActive ? "text-ink" : "text-ink-soft/70 group-hover:text-ink-soft"
                  }`}
                >
                  {s.title}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="process-active-underline"
                    className="absolute -bottom-2 h-[3px] w-8 rounded-full bg-magenta"
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Panel — min-h reserves space for the tallest step (2-card grid),
           so the section doesn't jump height when a step like 02 has only
           one detail card. */}
        <div className="relative mt-8 min-h-[220px] sm:min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              id={`process-panel-${step.id}`}
              role="tabpanel"
              aria-labelledby={`process-tab-${step.id}`}
              initial={reduced ? false : { clipPath: "inset(0 0 0 100%)", opacity: 0 }}
              animate={{ clipPath: "inset(0 0 0 0%)", opacity: 1 }}
              exit={reduced ? undefined : { clipPath: "inset(0 100% 0 0)", opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <p className="whitespace-nowrap text-center text-sm font-medium leading-relaxed text-white sm:text-xl lg:text-3xl">
                  {step.desc}
                </p>
              </motion.div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {[
                  { label: "Detail", text: step.detail },
                  { label: "Output", text: step.output },
                ].map((d, i) => (
                  <motion.div
                    key={d.label}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: reduced ? 0 : 0.05 + i * 0.05, ease: EASE }}
                    className="rounded-2xl bg-paper-2 p-7"
                  >
                    <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
                      <span className="font-semibold text-ink">{d.label}: </span>
                      {d.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
