"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { ArrowRight, ArrowUpRight, FileText, Sparkles } from "lucide-react";
import { LighthouseScores } from "@/components/LighthouseScores";
import { projects, mediums, type Medium, type Project } from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, cn } from "@/lib/utils";

type Filter = Medium | "all";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...mediums.map((m) => ({ id: m.id as Filter, label: m.label })),
];

/**
 * The whole result set animates as one keyed lane, driven from the parent
 * rather than per-card.
 *
 * Two earlier approaches both glitched on a filter switch and are worth
 * naming so they don't come back:
 *
 *  - `layout` on each card under `AnimatePresence mode="popLayout"`. Pop
 *    layout takes the exiting node out of flow, so layout projection
 *    measured every entering card against the *outgoing* lane's geometry —
 *    switching in from the empty state flung the cards in from wherever
 *    that centred notice had been sitting.
 *  - `whileInView` for the entry. On a filter switch the cards mount
 *    already on screen, so the reveal waited a frame or two on an
 *    IntersectionObserver callback that had nothing to observe — which read
 *    as the grid freezing before it appeared.
 *
 * So: no layout projection, no observer in the switch path. `mode="wait"`
 * lets the old lane clear before the new one builds, which keeps the two
 * sets from ever overlapping mid-flight.
 */
const laneVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/** Reduced motion keeps the cross-fade legible but strips travel and
 * stagger, so a switch is a single instant swap. */
const reducedLaneVariants: Variants = {
  hidden: {},
  visible: {},
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
};

/**
 * One project as a grid card: framed screenshot, sector, name, one line of
 * copy, the four Lighthouse scores as a 2x2 block beside that copy, and two
 * actions under a rule.
 *
 * The copy and the scores run as two columns rather than stacked, which is
 * the whole shape of the card: the sentence says what the build is, the
 * block beside it says how it measured, and the visitor reads both in one
 * pass instead of scrolling one past the other. Stacking put ~120px of
 * gauges between the name and the actions and made every card a column of
 * unrelated strips.
 *
 * No browser chrome around the screenshot. The address bar earns its place
 * on the case study, where it sits under a live URL the visitor is about to
 * click; at grid scale it added a dark 40px band above every capture and
 * four hostnames in 11px mono that nobody reads, and it made the card's
 * lightest element its heaviest one.
 *
 * HOVER — one cascade, not six tricks. The card is a light box and the
 * pointer is what switches it on, so the beats run in the order light would
 * actually reach things, each one handing off to the next:
 *
 *   0ms     the card lifts 7px and blooms a shadow in its OWN accent — the
 *           same hue as its sector label, so the lit card is lit in its
 *           colour rather than in a generic blue that belongs to no build
 *   0ms     the resting veil over the capture clears (500ms)
 *   0ms     the capture pushes in ~4.5% from its top edge, over 900ms — the
 *           slowest thing on the card, so it is still settling when
 *           everything else has arrived
 *   120ms   a specular rake sweeps across the capture, one pass, 1s
 *   60ms    the rule draws under the name, left to right
 *   90ms +  the four score boxes lift and take their band colour, 60ms
 *   60ms ea apart (see LighthouseScores) — the last beat, and the one that
 *           makes the whole move read as the audit lighting up
 *
 * Everything animates transform, opacity, colour or shadow only; nothing in
 * the cascade touches layout, so four cards' worth of it composites without
 * a reflow even while the grid is easing its own height on a filter switch.
 *
 * The zoom scales from `origin-top`, which matters: the crop the visitor was
 * reading stays the crop under their cursor, only closer. That is the whole
 * difference from the hover *pan* this card used to have — object-position
 * travelling top->bottom across a tall full-page capture, which swapped the
 * frame to an unrecognisable mid-page slice at the exact moment they
 * reached for it. Panning is gone for good; pushing in is not panning.
 *
 * Scroll parallax on the screenshot is also deliberately absent: drift
 * loosens a tight grid, where the cards need one firm baseline.
 */
function ProjectCard({ project, index, reduced }: { project: Project; index: number; reduced: boolean }) {
  return (
    <motion.article
      variants={reduced ? reducedCardVariants : cardVariants}
      /* Published as a variable rather than applied directly because the
         accent has to reach a border colour, a shadow colour and a gradient
         — all of them hover states, none of them settable inline. */
      style={
        {
          "--accent": project.accent === "magenta" ? "var(--magenta)" : "var(--blue)",
        } as React.CSSProperties
      }
      className={cn(
        "project-card group relative flex w-full flex-col rounded-[1.25rem] border border-line bg-paper p-3 shadow-[var(--shadow-resting)] will-change-[translate]",
        "sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]",
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden rounded-[0.875rem] bg-paper-2">
        <Image
          src={project.cover}
          alt={`${project.name} homepage`}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="project-card-shot origin-top object-cover object-top will-change-[scale]"
          priority={index < 3}
        />
        {/* Resting veil. A hair of ink over the capture keeps the four
            screenshots reading as one set at grid scale — they are four
            different sites with four different palettes — and clearing it
            on hover is what makes the hovered card look lit rather than
            merely moved. */}
        <div
          aria-hidden="true"
          className="project-card-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(22,22,28,0.16)] via-[rgba(22,22,28,0.04)] to-transparent"
        />
        {/* Specular rake — a single pass of light across the capture, the
            way a sheet of glass catches a lamp when you lean towards it.
            The bar lives off the left edge at rest, so there is nothing to
            fade in or out; `duration-0` at rest is what makes the return
            trip free, since an un-hover snaps it back to a position the
            well already clips. That is the whole reason this is a slide and
            not the usual opacity pulse: a pulse has to animate in BOTH
            directions and the reverse sweep always reads as a mistake. */}
        <div
          aria-hidden="true"
          className="project-card-rake pointer-events-none absolute -inset-y-1/2 left-[-45%] w-[38%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.34),transparent)] blur-[3px] will-change-[translate] motion-reduce:hidden"
        />
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-0.5 pt-5">
        {/* Two columns only at lg, where the grid's three-across card is
            ~440px and both halves have room. Below that the card is 260-360px
            wide, and holding the split there gave a ~150px score block beside
            a ~130px sentence — the summary ran seven lines and "L'Cinco
            Pizza" broke across two. So the block drops under the copy and
            spans the card. */}
        <div className="flex flex-1 flex-col items-start gap-4 lg:flex-row">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase leading-none tracking-[0.1em] text-[var(--accent)]">
              {project.sector}
            </p>

            {/* Underline wipes in from the left on hover — see
                .project-card-rule in globals.css for how, and why the whole
                cascade lives there rather than in hover utilities here.
                `w-fit` keeps the rule the width of the name, and it paints
                in the accent so it matches the label above it and the glow
                under the card. */}
            <h3 className="project-card-rule mt-2.5 w-fit pb-0.5 text-xl font-bold tracking-tight text-ink">
              {project.name}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{project.oneLiner}</p>
          </div>

          {/* The card's real argument, and the reason all four categories
              show — including a build's weakest: showing the short one is
              what makes the hundreds credible, and naming each category in
              full is what makes them checkable. Fixed width at lg so the
              four boxes stay square-ish and every card's block lines up
              across the row regardless of how long its summary runs. */}
          <LighthouseScores
            scores={project.lighthouse}
            size="sm"
            className="w-full lg:w-[11rem] lg:shrink-0"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-1">
          {/* Stretched link: the whole card is the case-study target, which
              leaves the live-site pill as the only other hit area — hence
              the z-10, which lifts it back above that ::after overlay. */}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-ink transition-colors duration-300 after:absolute after:inset-0 after:content-[''] group-hover:text-blue"
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            Case study
            <ArrowRight className="project-card-arrow h-4 w-4" />
          </Link>
          <a
            href={project.liveDemoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blue btn-sm group/live relative z-10 min-h-11"
          >
            Live site
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[var(--ease-site)] group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

/** Honest state for a filter that has nothing published yet — says what is
 * coming and where to read about the discipline meanwhile, rather than
 * rendering an empty grid or hiding the tab. */
function EmptyLane({ medium, reduced }: { medium: Medium; reduced: boolean }) {
  const lane = mediums.find((m) => m.id === medium);
  if (!lane) return null;
  return (
    <motion.div
      variants={reduced ? reducedCardVariants : cardVariants}
      className="card mx-auto max-w-2xl text-center"
    >
      <Sparkles className="mx-auto h-6 w-6 text-blue" aria-hidden="true" />
      <p className="mt-4 text-h3 text-ink">{lane.label} — publishing soon</p>
      <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink-soft">{lane.empty}</p>
      <Link
        href="/services"
        className="group mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105"
      >
        See the services
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </motion.div>
  );
}

export function WorkGrid() {
  const reduced = useReducedMotion();
  /** Websites, not All: every published build is a website today, so the two
   * lanes render the same four cards — but landing on Websites shows which
   * medium the work actually is, and leaves All as the wider view a visitor
   * opts into once the other lanes fill up. */
  const [active, setActive] = useState<Filter>("website");
  const visible = active === "all" ? projects : projects.filter((p) => p.medium === active);

  /** Live height of whatever lane is currently mounted. A ResizeObserver
   * rather than a measurement keyed off `active`: under `mode="wait"` the
   * new lane does not exist yet when `active` changes, so anything measured
   * then is still the outgoing set. */
  const laneRef = useRef<HTMLDivElement>(null);
  const [laneHeight, setLaneHeight] = useState<number | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const el = laneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setLaneHeight(Math.round(entry.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Only a tab press animates the height. Every other height change —
   * window resize, a late web font reflowing a summary to two lines —
   * should land instantly, the way it would with no wrapper at all. */
  const selectFilter = (id: Filter) => {
    if (id === active) return;
    setSwitching(true);
    setActive(id);
  };

  return (
    <div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Filter builds by medium"
      >
        {FILTERS.map((f) => {
          const count = f.id === "all" ? projects.length : projects.filter((p) => p.medium === f.id).length;
          const isActive = active === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectFilter(f.id)}
              className="relative inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2 text-sm transition-colors duration-300"
            >
              {/* Shared-layout pill: one element that travels between tabs
                  rather than four that cross-fade, so the selection reads as
                  a single object moving. */}
              {isActive && (
                <motion.span
                  layoutId="medium-filter-pill"
                  className="absolute inset-0 rounded-full bg-blue"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`font-avenir relative z-10 ${isActive ? "text-paper" : "text-ink-soft"}`}
              >
                {f.label}
              </span>
              <span
                className={`relative z-10 text-xs tabular-nums ${
                  isActive ? "text-paper/70" : "text-ink-soft/60"
                }`}
              >
                {count}
              </span>
              {!isActive && (
                <span className="absolute inset-0 rounded-full border border-line transition-colors duration-300 hover:border-blue" />
              )}
            </button>
          );
        })}
      </div>

      {/* Four builds and the empty notice are ~800px apart in height, so a
          bare swap teleported the closing CTA and the footer up the page the
          instant the lane changed. This outer box owns the height and eases
          between the two, which keeps everything below the grid travelling
          instead of jumping.

          `overflow` is clipped only while that height is in flight — at rest
          the box must not clip, or it would cut off the cards' hover lift
          and their resting shadow. */}
      <motion.div
        className="mt-10"
        style={{ overflow: switching ? "hidden" : "visible" }}
        animate={{ height: laneHeight ?? "auto" }}
        transition={switching && !reduced ? { duration: 0.4, ease: EASE } : { duration: 0 }}
        onAnimationComplete={() => setSwitching(false)}
      >
        {/* Flex rather than grid so a short final row centres itself — with
            four builds in three columns the last card would otherwise hang
            off the left edge, and the count changes per filter. */}
        <div ref={laneRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              variants={reduced ? reducedLaneVariants : laneVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-wrap justify-center gap-5"
            >
              {visible.length > 0 ? (
                visible.map((project, i) => (
                  <ProjectCard key={project.slug} project={project} index={i} reduced={reduced} />
                ))
              ) : (
                <EmptyLane medium={active as Medium} reduced={reduced} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
