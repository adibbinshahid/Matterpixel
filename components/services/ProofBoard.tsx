"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { proofBoard } from "@/content/servicesPage";
import { servicesCta } from "@/content/siteConfig";
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
 * mass is the numerals themselves, set at three different scales on an
 * irregular grid, with the two largest cropped by the right edge of the
 * viewport. Nothing is a card.
 *
 * The result reads as a board someone pinned evidence to, not a stat row.
 */

/** Type scale per `metric.scale` tier. Tier 1 is the headline evidence,
 * tier 3 the supporting marks — a flat scale is what makes a stat row look
 * like a component instead of a composition. */
const SIZE_BY_SCALE: Record<number, string> = {
  1: "text-[clamp(3.5rem,9vw,7.5rem)]",
  2: "text-[clamp(2.75rem,6vw,5rem)]",
  3: "text-[clamp(2.25rem,4.2vw,3.5rem)]",
};

function Metric({
  metric,
  index,
}: {
  metric: (typeof proofBoard.metrics)[number];
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <div className={metric.bleed ? "lg:-mr-24 xl:-mr-32" : undefined}>
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
        className={`${SIZE_BY_SCALE[metric.scale]} -mb-[0.08em] overflow-hidden pb-[0.08em] font-extrabold leading-[0.82] tracking-[-0.045em] text-blue`}
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

  // The oversized heading tracks slightly against the scroll. Small
  // amplitude on purpose: it should register as the board having depth,
  // not as the headline sliding around.
  const headingY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  // The faint pixel column in the gutter travels further, so the two
  // layers separate visibly as the section passes.
  const gutterY = useTransform(scrollYProgress, [0, 1], [90, -90]);

  const [tier1, tier2, tier3] = [
    proofBoard.metrics.filter((m) => m.scale === 1),
    proofBoard.metrics.filter((m) => m.scale === 2),
    proofBoard.metrics.filter((m) => m.scale === 3),
  ];

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
        {/* ── Heading ────────────────────────────────────────────────── */}
        <motion.div style={reduced ? undefined : { y: headingY }} className="relative z-10">
          <p className="label-eyebrow mb-3 inline-flex items-center gap-2">
            {proofBoard.eyebrow}
            <span className="h-px w-5 bg-blue" />
            <span className="h-1 w-1 rounded-full bg-magenta" />
          </p>

          <h2 className="max-w-[16ch] text-[clamp(1.875rem,3.6vw,2.75rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
            {proofBoard.heading[0]}{" "}
            <span className="text-magenta">{proofBoard.heading[1]}</span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
            {proofBoard.body}
          </p>
        </motion.div>

        {/* ── Tier 1: the two headline figures ───────────────────────── */}
        {/* Asymmetric column split (5/7), and the second figure bleeds past
            the container's right edge — the crop is what stops this reading
            as a two-up grid. */}
        <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          {tier1.map((m, i) => (
            <div
              key={m.value + m.unit}
              // Alternating span + a top offset on every second figure:
              // the stagger is what breaks the row, so it survives the list
              // growing or shrinking rather than depending on exactly two.
              className={i % 2 === 0 ? "lg:col-span-5" : "lg:col-span-7 lg:pt-5"}
            >
              <Metric metric={m} index={i} />
            </div>
          ))}
        </div>

        {/* ── Tier 2: mid-scale, offset right ────────────────────────── */}
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          {/* Empty leading column on desktop — the negative space is doing
              structural work, indenting tier 2 away from tier 1's edge. */}
          <div className="hidden lg:col-span-3 lg:block" />
          {tier2.map((m, i) => (
            <div key={m.value + m.unit} className="lg:col-span-4">
              <Metric metric={m} index={tier1.length + i} />
            </div>
          ))}
        </div>

        {/* ── Tier 3: supporting marks, back at the left edge ────────── */}
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-12 lg:gap-8">
          {tier3.map((m, i) => (
            <div key={m.value + m.unit} className="lg:col-span-3">
              <Metric metric={m} index={tier1.length + tier2.length + i} />
            </div>
          ))}

          {/* The board's closing move: the section's conversion action sits
              in the last column as a peer of the metrics, not as a banner
              bolted underneath them. */}
          <div className="lg:col-span-5 lg:col-start-9 lg:self-start">
            <motion.div
              className="border-t border-ink/15 pt-2"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {servicesCta.badges.map((b) => (
                  <span
                    key={b}
                    className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-soft"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <Link href="/contact?tab=booking" className="btn-brand group mt-4 w-fit">
                {servicesCta.button}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
