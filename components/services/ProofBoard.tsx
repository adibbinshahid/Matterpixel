"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { proofBoard } from "@/content/servicesPage";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * "Built with intent. Backed by results." — with the results actually
 * shown. Every figure here is lifted verbatim from siteConfig.stats; see
 * content/servicesPage.ts for the sourcing rule.
 *
 * Visual grammar: blue-dominant, but through *typography* rather than a
 * full-bleed blue fill — Process further down already owns the blue panel,
 * and two blue slabs in one page would flatten the rhythm. Here the blue
 * mass is the numerals themselves, all set at one flat size on a single
 * baseline so the row reads as one stat block. Nothing is a card.
 */

/** One flat size for every metric — six figures on one baseline read as a
 * single stat row, not a hierarchy. */
const METRIC_SIZE = "text-[clamp(2.75rem,5vw,4.5rem)]";

function Metric({
  metric,
  index,
}: {
  metric: (typeof proofBoard.metrics)[number];
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <div>
      {/* The numeral rises into a fixed mask rather than fading in — the
          figure uncovers from its own baseline, which reads as a value
          being set rather than content appearing.
          Implemented as overflow-hidden + translateY rather than an
          animated clip-path: `whileInView` does not reliably fire on a
          clipPath-only initial state (the element sits at its initial
          value indefinitely even while fully in view), and a transform is
          compositor-friendly where clip-path is not. The small bottom
          padding, cancelled by an equal negative margin, keeps the mask
          off glyph descenders without changing layout. */}
      <motion.p
        className={`${METRIC_SIZE} -mb-[0.08em] overflow-hidden pb-[0.08em] font-extrabold leading-[0.82] tracking-[-0.045em] text-blue`}
        // The in-view trigger MUST sit on the mask, not on the moving
        // numeral. The mask hides the numeral completely at its start
        // position, so an observer attached to the numeral would report it
        // as never intersecting and the animation would never fire — the
        // element would sit offset forever. The mask itself is always
        // visible, so it's a reliable trigger; the child animates via
        // variants it inherits from here.
        initial={reduced ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.span
          className="block"
          variants={{
            hidden: { y: "108%" },
            visible: {
              y: "0%",
              transition: { duration: 0.8, delay: index * 0.06, ease: EASE },
            },
          }}
        >
          {metric.value}
        </motion.span>
      </motion.p>

      {/* Annotation block, hung off a hairline directly under the numeral
          so figure and caption read as one editorial unit. */}
      <motion.div
        className="mt-3 border-t border-ink/15 pt-2"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.06, ease: EASE }}
      >
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-magenta">
          {metric.unit}
        </p>
        <p className="mt-1 text-sm font-bold tracking-tight text-ink">
          {metric.label}
        </p>
        <p className="mt-0.5 max-w-[26ch] text-xs leading-snug text-ink-soft">
          {metric.note}
        </p>
      </motion.div>
    </div>
  );
}

export function ProofBoard() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // The faint pixel column in the gutter travels further, so the two
  // layers separate visibly as the section passes.
  const gutterY = useTransform(scrollYProgress, [0, 1], [90, -90]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line bg-paper"
    >
      {/* Pixel column in the left gutter — the page's motif used as a
          measuring rule down the side of the board. Desktop only; on
          mobile the gutter doesn't exist to put it in. */}
      <motion.div
        aria-hidden="true"
        style={reduced ? undefined : { y: gutterY }}
        className="pointer-events-none absolute left-3 top-0 hidden h-full flex-col gap-2 xl:flex"
      >
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className="h-1.5 w-1.5"
            style={{
              background: i % 7 === 0 ? "var(--magenta)" : "var(--blue)",
              opacity: i % 7 === 0 ? 0.4 : 0.1 + ((i * 3) % 5) / 24,
            }}
          />
        ))}
      </motion.div>

      <div className="section-shell py-14 lg:py-16">
        {/* ── Single row, all six figures on one baseline ────────────── */}
        <div className="flex flex-wrap items-start gap-x-10 gap-y-10 lg:flex-nowrap lg:gap-x-8">
          {proofBoard.metrics.map((m, i) => (
            <div key={m.value + m.unit} className="min-w-[6.5rem] flex-1">
              <Metric metric={m} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
