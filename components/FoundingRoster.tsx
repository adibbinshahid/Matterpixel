"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { foundingOffer } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The closing panel on /about. Keeps the magenta field (it's the site's
 * hand-off into the dark footer) but composes it as an editorial spread
 * rather than a centred SaaS banner: a status strip along the top, then a
 * two-column close — an oversized statement facing an availability module.
 *
 * The vertical hairlines are the only decoration, and they're the panel's
 * own column grid made visible. They sit well under the headline in value:
 * structure you feel, not a table you read.
 */
/** Column-rule densities, one overlay each, swapped at the sm breakpoint. */
const COLUMN_RULES = [
  { columns: 3, className: "sm:hidden" },
  { columns: 6, className: "hidden sm:block" },
] as const;

export function FoundingRoster() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-line px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="absolute inset-0 bg-magenta" aria-hidden="true" />

      {/* Column rules — the panel's own grid made visible, faded at the edges
          so they read as structure rather than as a table. Six fields on
          desktop, three on phones where six would sit ~55px apart and turn
          into a texture. Kept at low alpha: the headline is the subject and
          the rules must never compete with it. */}
      {COLUMN_RULES.map(({ columns, className }) => (
        <div
          key={columns}
          aria-hidden="true"
          className={`absolute inset-y-0 left-1/2 w-[calc(100%-3rem)] max-w-[1400px] -translate-x-1/2 sm:w-[calc(100%-4rem)] lg:w-[calc(100%-6rem)] ${className}`}
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, rgba(250,248,243,0.06) 0 1px, transparent 1px calc(100% / ${columns}))`,
            maskImage:
              "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)",
            WebkitMaskImage:
              "linear-gradient(180deg, transparent, #000 18%, #000 82%, transparent)",
          }}
        />
      ))}

      <div className="relative mx-auto max-w-[1400px]">
        {/* Status strip — the section's eyebrow and its state, on one rule. */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-paper/25 pb-5">
            <p className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-paper">
              <motion.span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-paper"
                animate={reduced ? undefined : { opacity: [1, 0.25, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
              />
              {foundingOffer.eyebrow}
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-paper/70">
              {foundingOffer.status.label}
              <span className="mx-2 text-paper/40">/</span>
              <span className="text-paper">{foundingOffer.status.value}</span>
            </p>
          </div>
        </Reveal>

        {/* Statement against availability. The statement takes seven columns
            and the module five, so the close reads as a spread rather than a
            headline with a button parked under it. */}
        <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            {/* Each line wipes up from its own clip box, which is the one
                motion beat this panel gets. The whileInView gate sits on the
                <h2>, not on the lines: a line starts fully outside its clip
                box, so an observer on the line itself would see zero
                intersecting area and never release it. */}
            <motion.h2
              className="text-[clamp(2.25rem,6.4vw,5rem)] font-bold leading-[0.95] tracking-tight text-paper"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {foundingOffer.heading.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    variants={{
                      hidden: { y: "110%" },
                      visible: {
                        y: "0%",
                        transition: {
                          duration: reduced ? 0 : 0.9,
                          ease: EASE,
                          delay: reduced ? 0 : i * 0.1,
                        },
                      },
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </motion.h2>

            <Reveal delay={0.1}>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/90">
                {foundingOffer.body}
              </p>
              <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-paper/70">
                {foundingOffer.terms}
              </p>
            </Reveal>
          </div>

          {/* Availability module. Stated as a condition, never a slot count —
              the panel sells selectivity, not a countdown. The left rule from
              lg ties it back into the column grid behind it. */}
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="border-t border-paper/25 pt-8 lg:h-full lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 xl:pl-14">
              <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-paper/70">
                {foundingOffer.availability.label}
                <span aria-hidden="true" className="h-px w-8 bg-paper/35" />
              </p>
              {/* Deliberately capped below the headline at every width — the
                  module balances the statement, it never competes with it.
                  The second line drops in value so the pair reads as one
                  typographic statement of a condition rather than as a
                  two-line scarcity badge. */}
              <p className="mt-4 text-[2rem] font-bold uppercase leading-[0.95] tracking-tight text-paper sm:text-[2.75rem] lg:text-[clamp(2.25rem,3.4vw,3.25rem)]">
                {foundingOffer.availability.lines[0]}
                <br />
                <span className="text-paper/65">
                  {foundingOffer.availability.lines[1]}
                </span>
              </p>

              <Link
                href={foundingOffer.cta.href}
                className="btn-brand btn-on-brand on-magenta group mt-8 w-fit"
              >
                {foundingOffer.cta.label}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/70">
                {foundingOffer.micro}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
