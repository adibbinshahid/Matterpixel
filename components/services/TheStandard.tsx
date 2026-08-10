"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { standard } from "@/content/servicesPage";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The trust beat, immediately after the hero — and deliberately not a logo
 * wall. Matterpixel has no verifiable client logos yet (see the header note
 * in content/servicesPage.ts), so instead of borrowing credibility from
 * names it can't stand behind, this section prints the terms it *can* be
 * held to, as a ledger.
 *
 * Visual grammar, distinct from every other section on the page: a
 * two-column editorial split (statement left, ledger right) where the
 * ledger rows are hairline-ruled and scroll-linked — each row's rule draws
 * itself left-to-right as the section rises, so the ledger reads as being
 * *entered* rather than faded in. No cards, no pills, no badges.
 */
export function TheStandard() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "start 25%"],
  });

  // The statement column drifts up slightly slower than the page, so the
  // two columns separate as you pass — the section's only parallax, and
  // small enough to register as weight rather than as an effect.
  const statementY = useTransform(scrollYProgress, [0, 1], [28, -14]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line bg-paper"
    >
      {/* A single hairline running the full height at the column break —
          the spine the ledger hangs off. Hidden below lg where the layout
          stacks and it would just be a stray line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-line lg:block"
      />

      <div className="section-shell py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
          {/* ── Statement column ─────────────────────────────────────── */}
          <motion.div
            style={reduced ? undefined : { y: statementY }}
            className="lg:pr-12"
          >
            <p className="label-eyebrow mb-3 inline-flex items-center gap-2">
              {standard.eyebrow}
              <span className="h-px w-5 bg-blue" />
              <span className="h-1 w-1 rounded-full bg-magenta" />
            </p>

            <h2 className="text-[clamp(1.875rem,3.6vw,2.75rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
              {standard.heading.map((line, i) => (
                <motion.span
                  key={line}
                  className="block"
                  initial={reduced ? false : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                >
                  {/* Second line carries the emphasis — the argument is in
                      "something to prove", not in "built for brands". */}
                  {i === 1 ? <span className="text-blue">{line}</span> : line}
                </motion.span>
              ))}
            </h2>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
              {standard.note}
            </p>
          </motion.div>

          {/* ── Ledger column ────────────────────────────────────────── */}
          {/* Grid, not a stacked list — a single row of five cells instead
              of five stacked lines, so the ledger reads as compact
              reference rather than a scroll of separate line items. Each
              cell keeps its own top-drawn rule, so it still reads as a
              ledger being entered, just entered across rather than down. */}
          <div className="lg:pl-12">
            <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-3 lg:gap-y-0">
              {standard.entries.map((entry, i) => (
                <li key={entry.id} className="relative pt-3.5">
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 block h-px origin-left bg-line"
                    initial={reduced ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                  />

                  <motion.div
                    className="pb-5"
                    initial={reduced ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: 0.12 + i * 0.07, ease: EASE }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[0.625rem] tracking-[0.14em] text-ink/30">
                        {entry.id}
                      </span>
                      {/* Two-pixel mark — the page's pixel motif used as a
                          bullet. Magenta on the last entry so the ledger
                          visibly closes instead of just stopping. */}
                      <span aria-hidden="true" className="flex gap-1">
                        <span
                          className={`h-1.5 w-1.5 ${
                            i === standard.entries.length - 1 ? "bg-magenta" : "bg-blue"
                          }`}
                        />
                        <span className="h-1.5 w-1.5 bg-ink/15" />
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm font-bold leading-tight tracking-tight text-ink lg:text-[0.9375rem]">
                      {entry.value}
                    </p>
                    <p className="mt-1 text-[0.75rem] leading-snug text-ink-soft">
                      {entry.terms}
                    </p>
                  </motion.div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
