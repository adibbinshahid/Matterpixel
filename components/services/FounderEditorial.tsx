"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { founderEditorial } from "@/content/servicesPage";
import { founder } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The human credibility beat, built to be read inside half a screen.
 *
 * That constraint drives the whole layout: the portrait is sized against
 * viewport *height* (svh) rather than column width, so the composition can
 * never grow taller than the screen it's being read on, and the annotations
 * sit inline under the statement instead of in their own block. Nothing is
 * a card, and it still isn't a "meet the founder" profile — the portrait is
 * a plate, the copy is a statement, and the metadata is marginalia.
 *
 * Every credential restates siteConfig.founder — no new claim is introduced
 * here (see the sourcing note in content/servicesPage.ts).
 */
export function FounderEditorial() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Counter-parallax, amplitude cut to match the shorter section: at the
  // previous ±46/±60 the two columns visibly slid apart inside a block this
  // short, which read as drift rather than depth.
  const portraitY = useTransform(scrollYProgress, [0, 1], [-18, 18]);
  const typeY = useTransform(scrollYProgress, [0, 1], [22, -22]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line bg-paper"
    >
      <div className="section-shell py-12 lg:py-9">
        <p className="label-eyebrow mb-4 inline-flex items-center gap-2">
          {founderEditorial.eyebrow}
          <span className="h-px w-5 bg-blue" />
          <span className="h-1 w-1 rounded-full bg-magenta" />
        </p>

        {/* Height-driven on desktop (`auto_1fr`): the portrait declares its
            own height from the viewport and the type column takes the rest,
            rather than a 12-column split that would let the block grow with
            its content. */}
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr] lg:gap-12 xl:gap-16">
          {/* ── Portrait plate ───────────────────────────────────────── */}
          <motion.div
            style={reduced ? undefined : { y: portraitY }}
            className="relative"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--mp-radius-md)] bg-ink lg:h-[27svh] lg:max-h-[270px] lg:w-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={founder.photo ?? "/founder.webp"}
                alt={founder.name}
                // Square source in a 4:5 plate — cover fills the height, so
                // lifting the subject needs a transform. Scaled first so the
                // shift can't expose a gap at the bottom edge. Same handling
                // as FounderFeature's plate on /about.
                className="absolute inset-0 h-full w-full origin-top scale-[1.06] -translate-y-[4%] object-cover"
              />
            </div>

            <div className="mt-3 border-t-2 border-ink pt-2.5">
              <p className="text-base font-extrabold tracking-tight text-ink">
                {founder.name}
              </p>
              <p className="text-xs font-semibold text-ink-soft">{founder.role}</p>
            </div>
          </motion.div>

          {/* ── Statement + supporting detail ────────────────────────── */}
          <motion.div style={reduced ? undefined : { y: typeY }}>
            <h2 className="text-[clamp(1.375rem,2.5vw,2rem)] font-extrabold leading-[1] tracking-[-0.03em] text-ink">
              {founderEditorial.heading.map((line, i) => (
                <motion.span
                  key={line}
                  className="block"
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.65, delay: i * 0.08, ease: EASE }}
                >
                  {/* Final line is the whole argument — business and pixels. */}
                  {i === founderEditorial.heading.length - 1 ? (
                    <span className="text-blue">{line}</span>
                  ) : (
                    line
                  )}
                </motion.span>
              ))}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-snug text-ink-soft">
              {founderEditorial.body}
            </p>

            {/* Annotations — inline-flex, not a 2-col grid: a grid track
                stretches to the row's full width even with two short items,
                which read as a stray rule running across the page. Flex
                sizes each entry to its own content and packs them together. */}
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {founderEditorial.annotations.map((a, i) => (
                <motion.div
                  key={a.label}
                  className="border-t border-line pt-2"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
                >
                  <dt className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink/35">
                    {a.label}
                  </dt>
                  <dd className="mt-1 text-xs font-bold leading-tight text-ink">
                    {a.value}
                  </dd>
                </motion.div>
              ))}
            </dl>

            <Link href={founderEditorial.cta.href} className="btn-brand btn-sm group mt-4 w-fit">
              {founderEditorial.cta.label}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
