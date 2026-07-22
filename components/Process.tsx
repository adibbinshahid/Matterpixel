"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion } from "motion/react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PixelResolve } from "@/components/PixelResolve";
import { process } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DURATIONS, EASE } from "@/lib/utils";
import { GSAP_EASE } from "@/lib/gsapEase";

const MOBILE_BREAKPOINT = 768; // matches the site's shared `md` breakpoint
const HOLD = 0.7; // fraction of each step-unit spent held, before the travel to the next

/**
 * `data-cell` marks each cell for the pinned view's staggered "assemble"
 * animation — an echo of the Threshold's ignition-particle burst, so the
 * brand's own pixel motif is what announces each step, not a generic fade.
 */
function StepGlyph({ index }: { index: number }) {
  const cells = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="grid h-14 w-14 grid-cols-4 grid-rows-4 gap-0.5">
      {cells.map((i) => {
        const active = (i + index * 3) % 5 !== 0;
        return (
          <div
            key={i}
            data-cell
            style={{
              background: active ? (i % 2 === 0 ? "var(--blue)" : "var(--magenta)") : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * The only pinned scroll experience on the site. Gated on both
 * prefers-reduced-motion AND a `md`-and-up viewport check — pinned scroll
 * is fragile on mobile (dynamic viewport-height shifts from the browser
 * chrome showing/hiding can drift a pin's scroll-distance math), and this
 * environment has no way to test real device jank, so narrow viewports
 * get the same safe fallback as reduced-motion: same content, same
 * hierarchy, no pin.
 */
export function Process() {
  const reduced = useReducedMotion();
  const [showPinned, setShowPinned] = useState(true);

  useEffect(() => {
    const update = () => setShowPinned(!reduced && window.innerWidth >= MOBILE_BREAKPOINT);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [reduced]);

  return showPinned ? <PinnedProcess /> : <FallbackProcess />;
}

/**
 * Not a crossfade. The visitor travels *through* the four steps
 * horizontally — a pinned spatial journey, each step its own full-bleed
 * chapter with a giant watermark numeral as its anchor. A hand-drawn
 * progress line (blueprint motif — "systems, not guesswork") runs beneath
 * the whole thing, drawing itself in as the journey advances, with dots
 * that fill as each step is reached. Held-breath pacing: each step holds
 * for 70% of its unit before a quick travel to the next.
 */
function PinnedProcess() {
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glyphWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrap = pinWrapRef.current;
    const pinned = pinnedRef.current;
    const track = trackRef.current;
    const line = lineRef.current;
    const dots = dotRefs.current.filter((el): el is HTMLSpanElement => !!el);
    if (!wrap || !pinned || !track) return;

    const total = process.steps.length;

    gsap.set(dots[0], { scale: 1 });
    gsap.set(dots.slice(1), { scale: 0 });

    let lineLength = 0;
    if (line) {
      lineLength = line.getTotalLength();
      gsap.set(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength });
    }

    // Step 0's glyph assembles once, immediately — it has no preceding
    // travel segment of its own to carry that motion, unlike steps 1-3.
    const firstCells = glyphWrapRefs.current[0]?.querySelectorAll<HTMLElement>("[data-cell]");
    if (firstCells?.length) {
      gsap.fromTo(
        firstCells,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: GSAP_EASE, stagger: 0.015, delay: 0.15 },
      );
    }

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: wrap,
        pin: pinned,
        start: "top top",
        end: () => `+=${total * window.innerHeight}`,
        scrub: 0.6,
        anticipatePin: 1,
      },
    });

    // The line draws across the entire journey in one continuous motion —
    // the single throughline connecting every held-breath segment below.
    if (line) {
      tl.to(line, { strokeDashoffset: 0, duration: total - 1 }, 0);
    }

    for (let i = 0; i < total - 1; i++) {
      const segStart = i + HOLD;
      const travel = 1 - HOLD;
      const nextCells = glyphWrapRefs.current[i + 1]?.querySelectorAll<HTMLElement>("[data-cell]");

      tl.to(track, { x: () => -(i + 1) * window.innerWidth, duration: travel }, segStart).to(
        dots[i + 1],
        { scale: 1, duration: travel * 0.5 },
        segStart,
      );

      if (nextCells?.length) {
        tl.fromTo(
          nextCells,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: travel * 0.8, stagger: 0.015 },
          segStart + travel * 0.3,
        );
      }
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="border-t border-line">
      <div className="section-shell section-py-spacious">
        <motion.div
          initial={{ clipPath: "inset(0% 0% 100% 0%)", opacity: 0 }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: DURATIONS.standard, ease: EASE }}
        >
          <p className="label-eyebrow mb-4">{process.eyebrow}</p>
          <h2 className="max-w-xl text-h2 text-ink">{process.heading}</h2>
        </motion.div>
      </div>

      {/* +1 unit: GSAP's auto-generated pin-spacer reserves the scroll
         distance (`end`, steps*100vh) PLUS the pinned element's own natural
         height (one more 100vh, since it's h-screen) — sizing this wrapper
         to just steps*100vh undercounts by a full viewport, so the pinned
         content overflowed this wrapper's bottom edge and bled into
         whatever section came next. */}
      <div ref={pinWrapRef} style={{ height: `${(process.steps.length + 1) * 100}vh` }}>
        <div ref={pinnedRef} className="relative h-screen overflow-hidden">
          <div ref={trackRef} className="flex h-full" style={{ width: `${process.steps.length * 100}vw` }}>
            {process.steps.map((step, i) => (
              <div key={step.id} className="relative h-full w-screen shrink-0">
                {/* Giant watermark numeral — the step's graphic anchor.
                    Faint enough to never compete with the real text. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[4%] top-1/2 -translate-y-1/2 select-none text-[9rem] font-black leading-none text-ink/[0.07] sm:text-[13rem] lg:text-[17rem]"
                >
                  {step.id}
                </span>

                <div className="section-shell flex h-full max-w-xl flex-col justify-center">
                  <span className="label-eyebrow">Step {step.id} of {String(process.steps.length).padStart(2, "0")}</span>
                  <div
                    ref={(el) => {
                      glyphWrapRefs.current[i] = el;
                    }}
                    className="mt-5 h-14 w-14"
                  >
                    <StepGlyph index={i} />
                  </div>
                  <h3 className="mt-6 text-h2 text-ink">{step.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-ink-soft">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Hand-drawn progress line — fixed within the pinned viewport
              (not part of the horizontally-traveling track), the one
              throughline connecting every step. */}
          <div className="section-shell absolute inset-x-0 bottom-16" aria-hidden="true">
            <svg viewBox="0 0 100 1" preserveAspectRatio="none" className="h-px w-full max-w-xl overflow-visible">
              <line x1="0" y1="0.5" x2="100" y2="0.5" stroke="var(--line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <line
                ref={lineRef}
                x1="0"
                y1="0.5"
                x2="100"
                y2="0.5"
                stroke="var(--blue)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mt-[-4px] flex max-w-xl justify-between">
              {process.steps.map((step, i) => (
                <span
                  key={step.id}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className="h-2 w-2 rounded-full bg-blue"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** No pinning — same content, same hierarchy, plain sequential reveal.
 * Used under prefers-reduced-motion and below the `md` breakpoint. */
function FallbackProcess() {
  return (
    <section className="border-t border-line">
      <div className="section-shell section-py-spacious">
        <Reveal>
          <p className="label-eyebrow mb-4">{process.eyebrow}</p>
          <h2 className="max-w-xl text-h2 text-ink">{process.heading}</h2>
        </Reveal>

        <RevealGroup
          stagger={0.15}
          className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0"
        >
          {process.steps.map((step, i) => (
            <RevealItem
              key={step.id}
              className={`relative lg:px-8 ${i > 0 ? "lg:border-l lg:border-line" : ""}`}
            >
              <span className="label-eyebrow">[ {step.id} ]</span>
              <PixelResolve trigger="view" delay={i * 0.1} cell={8} className="mt-5 h-14 w-14">
                <StepGlyph index={i} />
              </PixelResolve>
              <h3 className="mt-6 text-h3 text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
