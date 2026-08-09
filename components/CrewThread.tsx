"use client";

import { useRef, type ReactNode } from "react";
import { motion, type Transition } from "motion/react";
import { useInView } from "motion/react";
import { team } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useFlowGroup, useFlowRail } from "@/lib/useScrollFlow";

/**
 * The crew beat, drawn as the operating model rather than listed as one.
 *
 * The argument this section has to make is a relationship, not four
 * capabilities: a brief goes in, Adib holds it, four specialists work
 * under it, one result comes out. So the section is a system diagram —
 * one thread that splits into four lanes and merges back — and the copy
 * hangs off its nodes.
 *
 * Hierarchy is enforced by surface, not by size alone: the lead is the
 * only dark plate and the only node with ports on both edges; the four
 * specialists are light plates that energise from a single top rule; the
 * result is the only magenta-keyed plate. Reading the surfaces alone
 * gives you the model.
 *
 * Geometry: the connectors are SVGs with `preserveAspectRatio="none"`, so
 * their x coordinates are just twelfths of the container (viewBox width
 * 1200) and stay locked to the node columns at any width, while the
 * viewBox height matches the rendered pixel height so nothing stretches
 * vertically. `vector-effect="non-scaling-stroke"` keeps the horizontal
 * squash off the stroke weight. Node centres, in viewBox units:
 *
 *   brief 204 (17%) · lead 600 (50%) · lanes 140/447/753/1060 · result 600
 *
 * Motion: one `useInView` gate drives a fixed delay timeline (see BEAT) for
 * every node and for the one-time draw of the connectors. On top of that,
 * and only while the diagram is on screen, the connectors carry a current
 * (see lib/useScrollFlow.ts) whose speed is the reader's own scroll
 * velocity, damped — the work moves through the system as they move through
 * the page. That's one shared rAF loop writing dash offsets, no React state.
 */

/** Fixed timeline, in seconds from the moment the section enters view. */
const BEAT = {
  brief: 0,
  threadToLead: 0.3,
  lead: 0.75,
  duties: 1.0,
  split: 1.45,
  roles: 1.9,
  merge: 2.6,
  result: 3.1,
  closing: 3.45,
} as const;

/** Per-duty stagger and per-role stagger, applied on top of their beat. */
const STAGGER = 0.09;

const DRAW: Transition = { duration: 0.75, ease: EASE };

/**
 * Specialist-plate surface. Deliberately not --paper and deliberately not a
 * grey: a couple of points darker than the page and a couple of points
 * cooler, which is enough for the four plates to read as physical surfaces
 * laid on the warm page without any shadow, tint or fill doing the work.
 * Local to this section rather than a global token — nothing else uses it.
 */
const PLATE = "#f3f3f5";

function useTimeline() {
  const reduced = useReducedMotion();
  /** Collapses the whole timeline when the user asked for less motion. */
  return (at: number) => (reduced ? 0 : at);
}

/* ---------------------------------------------------------------------- */
/* Nodes                                                                   */
/* ---------------------------------------------------------------------- */

/**
 * One station on the thread. On mobile every node sits on a single left
 * rail with a marker dot, so the split/merge geometry can drop away
 * without the "one thread" idea going with it.
 */
function Node({
  at,
  active,
  className,
  markerClassName,
  children,
}: {
  at: number;
  active: boolean;
  className?: string;
  /** Accent for the mobile rail marker — blue by default, magenta at the end. */
  markerClassName?: string;
  children: ReactNode;
}) {
  const t = useTimeline();

  return (
    <motion.div
      className={`relative pl-11 sm:pl-14 lg:pl-0 ${className ?? ""}`}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      animate={
        active
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 16, filter: "blur(6px)" }
      }
      transition={{ duration: 0.6, ease: EASE, delay: t(at) }}
    >
      <span
        aria-hidden="true"
        className={`absolute left-[11px] top-8 h-2.5 w-2.5 rounded-full ring-4 ring-paper sm:left-[19px] lg:hidden ${
          markerClassName ?? "bg-blue"
        }`}
      />
      {children}
    </motion.div>
  );
}

/**
 * Where a connector physically meets a plate. Desktop only — it exists so
 * no line ever appears to float past an edge it doesn't touch.
 */
function Port({
  edge,
  tone = "blue",
}: {
  edge: "top" | "bottom";
  tone?: "blue" | "magenta";
}) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-1/2 hidden h-2 w-2 -translate-x-1/2 rounded-full lg:block ${
        edge === "top" ? "-top-1" : "-bottom-1"
      } ${tone === "magenta" ? "bg-magenta" : "bg-blue"}`}
    />
  );
}

/** The entry plate — small on purpose. The client's input is the smallest
 * thing in the diagram because handing it over is all they have to do. */
function BriefNode() {
  return (
    <div className="relative rounded-[20px] border border-line bg-paper px-6 py-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue">
        {team.brief.label}
      </p>
      <p className="mt-1.5 text-[0.9375rem] leading-snug text-ink-soft">
        {team.brief.note}
      </p>
      <Port edge="bottom" />
    </div>
  );
}

/**
 * The hub. The only dark plate in the diagram, because it's the only node
 * the client actually deals with — and the only one carrying ports on both
 * edges, since everything routes through it.
 */
function LeadNode({ active }: { active: boolean }) {
  const t = useTimeline();

  return (
    // Ports sit outside the clipped plate: the plate has to clip its own
    // gradient field to the 28px radius, and a port is meant to overhang.
    <div className="relative">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-7 py-9 sm:px-10 sm:py-10">
        {/* Faint field behind the hub — the site's blue→magenta pairing at
            low opacity, so the control point reads warmer than flat ink. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 120% at 12% 0%, var(--blue), transparent 60%), radial-gradient(60% 110% at 92% 100%, var(--magenta), transparent 62%)",
            opacity: 0.14,
          }}
        />

        <div className="relative">
          <p className="text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-paper/50">
            Your single point of contact
          </p>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-4xl font-bold leading-none tracking-tight text-paper sm:text-5xl">
              {team.lead.name}
            </p>
            <p className="text-sm font-semibold text-paper/70">{team.lead.role}</p>
          </div>

          {/* The four things he holds. Hairline-divided rather than pilled, so
              they read as one responsibility set instead of four tags. Set as
              a wrapping row, not a 4-column grid: at the narrow end of lg the
              plate is ~480px and "Accountability" alone is wider than a
              quarter of it, so fixed columns would clip it. */}
          <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3.5 border-t border-paper/15 pt-6 sm:justify-between">
            {team.lead.duties.map((duty, i) => (
              <motion.li
                key={duty}
                className="flex items-center gap-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-paper/85"
                initial={{ opacity: 0, y: 8 }}
                animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{
                  duration: 0.45,
                  ease: EASE,
                  delay: t(BEAT.duties + i * STAGGER),
                }}
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-blue" />
                {duty}
              </motion.li>
            ))}
          </ul>
        </div>
        </div>

      <Port edge="top" />
      <Port edge="bottom" />
    </div>
  );
}

/**
 * One specialist node. The verb is the headline — the row reads
 * BUILD · GROW · CREATE · AUTOMATE before any technical detail is read —
 * and the top rule wiping in is the node "coming online".
 */
function RoleNode({
  role,
  index,
  active,
  at,
}: {
  role: (typeof team.roles)[number];
  index: number;
  active: boolean;
  at: number;
}) {
  const t = useTimeline();
  const reduced = useReducedMotion();

  return (
    // As with the hub: the plate clips (the energised edge has to follow the
    // 24px radius), the ports overhang, so they're siblings not children.
    <div className="relative h-full">
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[24px] border border-line p-6 sm:p-7 lg:p-6"
        style={{ backgroundColor: PLATE }}
      >
        {/* Energised edge — 2px, drawn left to right as the node activates. */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.5 origin-left bg-blue"
          initial={{ scaleX: 0 }}
          animate={active ? { scaleX: 1 } : { scaleX: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: EASE, delay: t(at) }}
        />

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-bold tracking-[0.18em] text-blue">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="inline-flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-ink-soft/60">
            <motion.span
              aria-hidden="true"
              className="h-1 w-1 rounded-full bg-magenta"
              animate={reduced || !active ? undefined : { opacity: [1, 0.2, 1] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.3,
              }}
            />
            {role.status}
          </span>
        </div>

        {/* On phones and tablets the node is a wide band, so the verb block and
            the technical detail sit on facing sides; from lg it stacks. */}
        <div className="mt-5 flex-1 sm:flex sm:items-end sm:justify-between sm:gap-8 lg:mt-6 lg:block">
          <div>
            {/* The verb is the node's name. It is set a step above the
                technical detail below it so the row reads BUILD · GROW ·
                CREATE · AUTOMATE before a single spec is read. */}
            <p className="text-[1.875rem] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-ink lg:text-[1.75rem] xl:text-[2rem]">
              {role.verb}
            </p>
            <p className="mt-2.5 text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">
              {role.title}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:text-right lg:mt-5 lg:text-left">
            <p className="text-sm leading-relaxed text-ink-soft/85">{role.desc}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft/60">{role.detail}</p>
          </div>
        </div>
        </div>

      <Port edge="top" />
      {/* Magenta on the way out: the lane leaving a specialist is already
          part of the merge, and the port is where that hand-off happens. */}
      <Port edge="bottom" tone="magenta" />
    </div>
  );
}

/** The exit plate. Largest node in the diagram after the hub — it's the
 * payoff the four lanes exist to produce, so it's the one plate keyed in
 * full brand magenta. Two solid surfaces close the diagram, ink for the
 * hub and magenta for the output; everything between them is light. */
function ResultNode({ active }: { active: boolean }) {
  const t = useTimeline();

  return (
    <div className="relative">
      {/* No landing mark on the top edge: now that the plate is solid
          magenta, the magenta trunk terminating into it *is* the landing —
          any bar drawn there only notches the edge. */}
      <div className="relative overflow-hidden rounded-[28px] bg-magenta px-7 py-9 text-center sm:px-10 sm:py-11">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-paper/75">
        {team.result.label}
      </p>
      <p className="mt-3 text-[2.75rem] font-bold leading-none tracking-tight text-paper sm:text-[3.5rem]">
        {team.result.title}
      </p>
      <ul className="mx-auto mt-7 flex max-w-md flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-paper/30 pt-6">
        {team.result.marks.map((mark, i) => (
          <motion.li
            key={mark}
            className="inline-flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-paper/90"
            initial={{ opacity: 0, y: 6 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{
              duration: 0.45,
              ease: EASE,
              delay: t(BEAT.result + 0.2 + i * STAGGER),
            }}
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-paper" />
            {mark}
          </motion.li>
        ))}
      </ul>
      </div>
      <Port edge="top" tone="magenta" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Connectors                                                              */
/* ---------------------------------------------------------------------- */

/**
 * The pulse that travels the connectors, built as three coincident dashes
 * rather than one: a wide faint wake, a mid body, and a short bright head.
 * `data-flow-lag` (max length minus own length) aligns all three at the
 * *head*, so what moves is a tapered leading edge with a trail behind it —
 * a body of liquid in the channel, not a marching dash.
 *
 * Paths declare `pathLength={100}`, so a dash length is a percentage of the
 * run and every lane — long outer, short inner — carries its pulse at the
 * same proportional speed. That's what makes the four specialist streams
 * arrive at the result plate together.
 */
const FLOW_LAYERS = [
  { width: 7, opacity: 0.09, length: 30 },
  { width: 3, opacity: 0.38, length: 16 },
  { width: 3, opacity: 0.95, length: 6 },
] as const;

const FLOW_HEAD = 30;

/**
 * sRGB twins of --blue / --magenta, used *only* by the flow layers.
 *
 * Those tokens resolve to Display-P3 where it's supported, and the merge
 * trunk is the one place in the diagram where all four lanes lie on the same
 * geometry: twelve translucent strokes compositing on one run. Accumulating
 * that many out-of-gamut samples clips, and the trunk — the most important
 * pixel in the section — came out cyan. In-gamut values composite to
 * themselves no matter how many times they stack.
 */
const FLOW_SRGB = { "var(--blue)": "#2c4bff", "var(--magenta)": "#ff2e93" } as const;

/**
 * A connector. Three layers: a permanent channel in the page's rule colour,
 * an accent that draws itself along the channel when the beat arrives, and
 * the liquid — which only ever moves, never appears or disappears, so the
 * channel still reads as a channel when the page is still.
 *
 * Desktop only; the mobile rail replaces it. `stage` offsets this stretch's
 * phase against the shared clock (0 → -33 → -66 down the diagram), so the
 * current reads as one thing passing through brief, lead, lanes and result
 * in that order instead of every stretch pulsing at once.
 */
function Thread({
  paths,
  height,
  at,
  active,
  flowing,
  accent = "var(--blue)",
  stage = 0,
}: {
  paths: string[];
  height: number;
  at: number;
  active: boolean;
  /** Drawn (`active`) *and* on screen — see CrewThread's `onScreen`. */
  flowing: boolean;
  accent?: keyof typeof FLOW_SRGB;
  stage?: number;
}) {
  const t = useTimeline();
  const reduced = useReducedMotion();
  const flowRef = useFlowGroup(flowing && !reduced);

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 1200 ${height}`}
      preserveAspectRatio="none"
      className="hidden w-full lg:block"
      style={{ height }}
      fill="none"
    >
      {paths.map((d) => (
        <path
          key={`base-${d}`}
          d={d}
          stroke="var(--line)"
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {paths.map((d, i) => (
        <motion.path
          key={`accent-${d}`}
          d={d}
          stroke={accent}
          strokeOpacity={0.3}
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={active ? { pathLength: 1 } : { pathLength: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { ...DRAW, delay: t(at) + i * 0.06 }
          }
        />
      ))}

      {/* The liquid, held back until its stretch of channel has been drawn.
          Outer group fades it in on the beat; inner group is the one the
          scroll clock writes to, so the two never fight over `opacity`. */}
      {!reduced && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={active ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: t(at + 0.55) }}
        >
          <g ref={flowRef} data-flow-stage={stage}>
            {paths.map((d) =>
              FLOW_LAYERS.map((layer) => (
                <path
                  key={`flow-${layer.length}-${d}`}
                  d={d}
                  pathLength={100}
                  stroke={FLOW_SRGB[accent]}
                  strokeOpacity={layer.opacity}
                  strokeWidth={layer.width}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={`${layer.length} ${100 - layer.length}`}
                  data-flow-lag={FLOW_HEAD - layer.length}
                />
              )),
            )}
          </g>
        </motion.g>
      )}
    </svg>
  );
}

/** Brief (x 204) curving into the lead node (x 600). */
const PATH_TO_LEAD = ["M204 0 V28 Q204 54 232 54 H572 Q600 54 600 80 V104"];

/**
 * Lead (x 600) fanning out to the four lanes (x 140/447/753/1060).
 *
 * The outer pair turns high and the inner pair turns low, so no two
 * horizontal runs ever share a y — the fan reads as four distinct
 * routings rather than one thick bar.
 */
const PATH_SPLIT = [
  "M600 0 V18 Q600 42 574 42 H166 Q140 42 140 66 V114",
  "M600 0 V50 Q600 74 574 74 H473 Q447 74 447 98 V114",
  "M600 0 V50 Q600 74 626 74 H727 Q753 74 753 98 V114",
  "M600 0 V18 Q600 42 626 42 H1034 Q1060 42 1060 66 V114",
];

/**
 * The four lanes converging on the result node (x 600). Every lane ends on
 * the same vertical drop, which is the merge — visually, four threads
 * become one before the plate, and the shared trunk carries all four pulses
 * at once, so the convergence is brighter than any single lane. Inner pair
 * turns at y 38, outer at y 75, so the horizontal runs stack rather than
 * crowd the same band.
 */
const PATH_MERGE = [
  "M140 0 V50 Q140 75 166 75 H574 Q600 75 600 100 V128",
  "M447 0 V14 Q447 38 473 38 H574 Q600 38 600 62 V128",
  "M753 0 V14 Q753 38 727 38 H626 Q600 38 600 62 V128",
  "M1060 0 V50 Q1060 75 1034 75 H626 Q600 75 600 100 V128",
];

/* ---------------------------------------------------------------------- */

export function CrewThread() {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.12 });
  /** Separate, non-`once` gate: the reveal timeline plays once, but the
   * scroll-driven current is only worth computing while the diagram is
   * actually on screen. Off screen, nothing subscribes and the shared rAF
   * loop stops entirely. */
  const onScreen = useInView(ref, { amount: 0 });
  const t = useTimeline();
  const reduced = useReducedMotion();
  const railRef = useFlowRail(onScreen && !reduced);

  return (
    <section className="border-t border-line px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
      <div ref={ref} className="mx-auto max-w-[1400px]">
        {/* Header — the headline carries the section, so it takes two thirds
            of the grid and the supporting line sits small beside it. */}
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={
              active
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 20, filter: "blur(6px)" }
            }
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="label-eyebrow mb-4 inline-flex items-center gap-2">
              {team.eyebrow}
              <span className="h-px w-5 bg-blue" />
              <span className="h-1 w-1 rounded-full bg-magenta" />
            </p>
            <h2 className="text-4xl font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[clamp(2.5rem,4.2vw,3.875rem)]">
              {team.heading[0]}
              <br />
              {team.heading[1]}
            </h2>
          </motion.div>

          <motion.p
            className="max-w-md text-[0.9375rem] leading-relaxed text-ink-soft lg:col-span-4 lg:pb-2"
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={
              active
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 20, filter: "blur(6px)" }
            }
            transition={{ duration: 0.7, ease: EASE, delay: t(0.12) }}
          >
            {team.body}
          </motion.p>
        </div>

        {/* Diagram. `relative` carries the mobile rail behind every node. */}
        <div className="relative mt-9 lg:mt-10">
          {/* Mobile rail — the same thread, straightened: channel, drawn
              accent, and the same current running down it. */}
          <span
            aria-hidden="true"
            className="absolute bottom-10 left-4 top-8 w-[3px] rounded-full bg-line sm:left-6 lg:hidden"
          />
          <motion.span
            aria-hidden="true"
            className="absolute bottom-10 left-4 top-8 w-[3px] origin-top rounded-full bg-gradient-to-b from-blue/35 via-blue/35 to-magenta/35 sm:left-6 lg:hidden"
            initial={{ scaleY: 0 }}
            animate={active ? { scaleY: 1 } : { scaleY: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 3, ease: EASE, delay: t(0.3) }
            }
          />
          {/* The pulse. One 22%-tall gradient band moved by background
              position, masked at both ends so its wrap is never seen. */}
          {!reduced && (
            <span
              ref={railRef}
              aria-hidden="true"
              className="absolute bottom-10 left-4 top-8 w-[3px] rounded-full opacity-0 sm:left-6 lg:hidden"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, transparent 0%, var(--blue) 55%, var(--magenta) 78%, transparent 100%)",
                backgroundSize: "100% 22%",
                backgroundRepeat: "no-repeat",
                maskImage: "linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)",
              }}
            />
          )}

          <Node at={BEAT.brief} active={active} className="lg:ml-[4%] lg:w-[26%]">
            <BriefNode />
          </Node>

          <Thread
            paths={PATH_TO_LEAD}
            height={104}
            at={BEAT.threadToLead}
            active={active}
            flowing={active && onScreen}
          />

          <Node
            at={BEAT.lead}
            active={active}
            className="mt-4 lg:mx-auto lg:mt-0 lg:w-[52%]"
          >
            <LeadNode active={active} />
          </Node>

          <Thread
            paths={PATH_SPLIT}
            height={114}
            at={BEAT.split}
            active={active}
            flowing={active && onScreen}
            stage={-33}
          />

          <div className="mt-4 grid gap-4 lg:mt-0 lg:grid-cols-4 lg:gap-5">
            {team.roles.map((role, i) => (
              <Node
                key={role.title}
                at={BEAT.roles + i * STAGGER}
                active={active}
                className="h-full"
              >
                <RoleNode
                  role={role}
                  index={i}
                  active={active}
                  at={BEAT.roles + i * STAGGER}
                />
              </Node>
            ))}
          </div>

          <Thread
            paths={PATH_MERGE}
            height={128}
            at={BEAT.merge}
            active={active}
            flowing={active && onScreen}
            accent="var(--magenta)"
            stage={-66}
          />

          <Node
            at={BEAT.result}
            active={active}
            markerClassName="bg-magenta"
            className="mt-4 lg:mx-auto lg:mt-0 lg:w-[48%]"
          >
            <ResultNode active={active} />
          </Node>
        </div>

        {/* Closing statement — centred, because the whole diagram has just
            converged on centre and the sentence is the same convergence in
            words. */}
        <motion.div
          className="mt-10 border-t border-line pt-8 text-center lg:mt-11 lg:pt-9"
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={
            active
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 18, filter: "blur(6px)" }
          }
          transition={{ duration: 0.7, ease: EASE, delay: t(BEAT.closing) }}
        >
          <p className="text-xl font-bold tracking-tight text-ink-soft sm:text-2xl">
            {team.closing[0]}
          </p>
          <p className="mt-1 text-[2.75rem] font-bold uppercase leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-[clamp(3.25rem,6vw,5.25rem)]">
            {team.closing[1]}
          </p>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ink-soft">
            {team.note}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
