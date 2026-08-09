"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Code2, Megaphone, PenTool, Sparkles } from "lucide-react";
import { PixelResolve } from "@/components/PixelResolve";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { founder } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** One icon per discipline, keyed by `credentials[].icon` in siteConfig. */
const CREDENTIAL_ICONS = {
  brand: Megaphone,
  code: Code2,
  ai: Sparkles,
  design: PenTool,
} as const;

/**
 * Portrait plate. Until a real photo exists (founder.photo), the subject
 * is the monogram itself — set on the dark ink panel so it reads as a
 * deliberate typographic portrait rather than an empty avatar slot.
 *
 * Two authored layers on top of the site's PixelResolve dissolve:
 * a slow diagonal specular sweep that keeps crossing the plate (the
 * "light moving over glass" beat, ambient/linear so the loop doesn't
 * stutter), and a magenta->blue corner bloom that breathes underneath it.
 */
function PortraitPlate() {
  const reduced = useReducedMotion();

  return (
    <PixelResolve
      cell={26}
      // On large screens the plate is height-driven, not width-driven: the
      // founder block has to land inside one viewport, so the portrait takes
      // its cue from the screen and lets the 4:5 ratio derive the width.
      className="aspect-[4/5] w-full rounded-[28px] lg:h-[min(62svh,600px)] lg:w-auto"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-ink">
        {founder.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={founder.photo}
            alt={founder.name}
            // Square source in a 4:5 plate: cover already fills the height, so
            // lifting the subject needs a transform. Scaled slightly first so
            // the shift never exposes a gap at the bottom edge.
            className="absolute inset-0 h-full w-full origin-top scale-[1.06] -translate-y-[4%] object-cover"
          />
        ) : (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute -inset-1/4"
              style={{
                background:
                  "radial-gradient(55% 55% at 25% 20%, var(--magenta), transparent 70%), radial-gradient(60% 60% at 80% 85%, var(--blue), transparent 70%)",
                opacity: 0.55,
              }}
              animate={reduced ? undefined : { scale: [1, 1.12, 1], rotate: [0, 6, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none tracking-tighter text-paper/90 sm:text-[11rem] lg:text-[clamp(6rem,18svh,9rem)]"
            >
              {founder.initials}
            </span>
          </>
        )}

        {/* Specular sweep — one narrow band travelling corner to corner. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg]"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
          }}
          animate={reduced ? undefined : { x: ["0%", "400%"] }}
          transition={{ duration: 6, repeat: Infinity, repeatDelay: 3.5, ease: "linear" }}
        />

        {/* Name plate, floated over the bottom of the portrait. */}
        <div
          className="absolute inset-x-0 bottom-0 p-6 text-center sm:p-8 lg:p-6"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(10,10,14,0.85) 55%)",
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
            className="text-2xl font-bold leading-tight tracking-tight text-paper sm:text-3xl"
          >
            {founder.name}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.45 }}
            className="mt-0.5 text-[0.9625rem] font-bold leading-relaxed text-paper/85"
          >
            {founder.role}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.52 }}
            className="mt-1 text-xs tracking-[0.06em] text-paper/60"
          >
            {founder.roleScope}
          </motion.p>
        </div>
      </div>
    </PixelResolve>
  );
}

/**
 * The About page's centrepiece: one named person up front, so the page
 * reads as "here's who you'll work with", not "here's an agency of nobody
 * in particular". The wider crew is the next section's job — see
 * CrewThread.tsx.
 */
export function FounderFeature() {
  return (
    <section className="border-t border-line px-6 py-14 sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* The founder beat is sized to sit inside a single screen on desktop:
            the portrait is capped against viewport height and the block takes
            only the room it needs, so portrait and copy read in one pass. */}
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr] lg:gap-14 xl:gap-20">
          <Reveal>
            <PortraitPlate />
          </Reveal>

          <div>
            <Reveal delay={0.1}>
              <p className="label-eyebrow mb-4 inline-flex items-center gap-2">
                {founder.eyebrow}
                <span className="h-px w-5 bg-blue" />
                <span className="h-1 w-1 rounded-full bg-magenta" />
              </p>
              <h2 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[clamp(2rem,3.4vw,3rem)]">
                {founder.heading}
              </h2>
            </Reveal>

            <RevealGroup className="mt-6 flex flex-col gap-4 lg:mt-4 lg:gap-3" stagger={0.08}>
              {founder.bio.map((p) => (
                <RevealItem key={p}>
                  <p className="max-w-xl text-lg leading-relaxed text-ink-soft lg:text-base">{p}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.12}>
              <p className="label-eyebrow mt-8 text-base lg:mt-5">{founder.credentialsLead}</p>
            </Reveal>

            <RevealGroup
              className="mt-3 grid max-w-xl gap-3 sm:grid-cols-2 lg:gap-2.5"
              stagger={0.06}
            >
              {founder.credentials.map((c) => {
                const Icon = CREDENTIAL_ICONS[c.icon];
                return (
                  <RevealItem
                    key={c.label}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-ink/[0.035] px-5 py-4 lg:py-3"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-blue" strokeWidth={2} />
                    <span className="text-sm font-semibold text-ink">{c.label}</span>
                  </RevealItem>
                );
              })}
            </RevealGroup>

            {/* Proof anchor — figures restated from the site's existing
                stats, sat directly under the bio so the claim and the
                evidence are read in one pass. */}
            <RevealGroup
              className="mt-10 grid max-w-xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:mt-6"
              stagger={0.08}
            >
              {founder.proof.map((p) => (
                <RevealItem key={p.label} className="bg-paper px-5 py-5 lg:py-4">
                  <p className="text-3xl font-bold leading-none tracking-tight text-ink lg:text-2xl">
                    {p.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">{p.label}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{p.note}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.15}>
              {/* Conversion action, same as every other "book a call" link
                  on the site — so it takes the primary pill, not the
                  outlined secondary it was using. */}
              <Link href="/contact?tab=booking" className="btn-brand group mt-8 w-fit lg:mt-6">
                Talk to Adib directly
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Reveal>
          </div>
        </div>

      </div>
    </section>
  );
}
