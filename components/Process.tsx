"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Reveal } from "@/components/Reveal";
import { processSteps } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { GSAP_EASE } from "@/lib/gsapEase";

/**
 * `data-cell` marks each cell for the row's staggered "assemble"
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
 * A single-screen horizontal row, not a pinned scroll journey — the whole
 * process is visible at once, no scroll-jacking. What still ties the four
 * steps together as one system (echoing "Systems, not guesswork.") is a
 * hand-drawn blueprint line across the top, drawing itself in once when
 * the row enters view, with each step's dot/glyph/copy assembling in as
 * the line "reaches" it. One authored GSAP timeline, triggered once
 * (`scrollTrigger: { once: true }`, no pin, no scrub) — not the generic
 * per-item fade `RevealGroup` uses elsewhere, since the line-draw is what
 * makes this section's connected-steps idea legible instead of just four
 * independent cards.
 */
export function Process() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const glyphWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section) return;

    const total = processSteps.steps.length;
    const dots = dotRefs.current.filter((el): el is HTMLSpanElement => !!el);
    const cellGroups = glyphWrapRefs.current.map(
      (el) => el?.querySelectorAll<HTMLElement>("[data-cell]") ?? null,
    );
    const cells = cellGroups.filter((g): g is NodeListOf<HTMLElement> => !!g);
    const texts = textRefs.current.filter((el): el is HTMLDivElement => !!el);

    if (reduced) {
      // `useReducedMotion()` always starts `false` on first render (it
      // can't know `matchMedia` before mount) and flips to `true` a tick
      // later — so this effect's *first* run, below, may already have
      // hidden everything before that flip re-runs it here. Explicitly
      // force the visible end-state rather than just bailing out, or
      // those elements stay stuck invisible with nothing left to reveal
      // them (the scrollTrigger/timeline that would have gets killed by
      // this same re-run's cleanup before it ever plays).
      gsap.set(dots, { scale: 1 });
      gsap.set(cells, { scale: 1, opacity: 1 });
      gsap.set(texts, { opacity: 1, y: 0 });
      if (line) gsap.set(line, { strokeDasharray: "none", strokeDashoffset: 0 });
      return;
    }

    gsap.set(dots, { scale: 0 });
    gsap.set(cells, { scale: 0, opacity: 0 });
    gsap.set(texts, { opacity: 0, y: 16 });

    let lineLength = 0;
    if (line) {
      lineLength = line.getTotalLength();
      gsap.set(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength });
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
      defaults: { ease: GSAP_EASE },
    });

    const drawDuration = 1;
    if (line) {
      tl.to(line, { strokeDashoffset: 0, duration: drawDuration, ease: "power2.inOut" }, 0);
    }

    for (let i = 0; i < total; i++) {
      // Where the line "reaches" this step's dot, as a fraction of the draw.
      const reach = total > 1 ? (i / (total - 1)) * drawDuration : 0;
      tl.to(dots[i], { scale: 1, duration: 0.3 }, reach);
      const stepCells = cellGroups[i];
      if (stepCells?.length) {
        tl.to(stepCells, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.015 }, reach + 0.05);
      }
      const text = textRefs.current[i];
      if (text) {
        tl.to(text, { opacity: 1, y: 0, duration: 0.4 }, reach + 0.1);
      }
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} className="border-t border-line">
      <div className="section-shell section-py-spacious">
        <Reveal>
          <p className="label-eyebrow mb-4">{processSteps.eyebrow}</p>
          <h2 className="max-w-xl text-h2 text-ink">{processSteps.heading}</h2>
        </Reveal>

        {/* Blueprint rail — dots sit at each step's horizontal center via
           the same `justify-between` row the 4-column grid below uses, so
           they line up without hardcoding percentage positions. */}
        <div className="relative mt-16">
          <svg viewBox="0 0 100 1" preserveAspectRatio="none" className="h-px w-full overflow-visible">
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
          <div className="mt-[-4px] hidden justify-between lg:flex">
            {processSteps.steps.map((step, i) => (
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

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {processSteps.steps.map((step, i) => (
            <div key={step.id} className={`relative lg:px-8 ${i > 0 ? "lg:border-l lg:border-line" : ""}`}>
              <span className="label-eyebrow">[ {step.id} ]</span>
              <div
                ref={(el) => {
                  glyphWrapRefs.current[i] = el;
                }}
                className="mt-5 h-14 w-14"
              >
                <StepGlyph index={i} />
              </div>
              <div
                ref={(el) => {
                  textRefs.current[i] = el;
                }}
              >
                <h3 className="mt-6 text-h3 text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
