"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, cn } from "@/lib/utils";
import type { LighthouseScores as Scores } from "@/content/projects";

/**
 * The four Lighthouse category scores, in two forms.
 *
 *  - `lg` — the ring gauges, for the case study's metrics band where there
 *    is room for them. The ring is the shape a prospect has already seen in
 *    PageSpeed Insights, and borrowing that form is what makes the numbers
 *    read as "we ran the audit" rather than "we picked four flattering
 *    figures" — the same job the address bar does in BrowserFrame.
 *  - `sm` — a 2x2 block of labelled score boxes, for the project grid
 *    card. Four rings on a card meant a tall, mostly-empty tile whose only
 *    readable labels were abbreviations ("A11Y", "BEST"), and whose
 *    PageSpeed colour wheel was the one element on the page that belonged
 *    to Google's design system instead of this one. A meter list replaced
 *    it and read as a settings panel — four thin tracks that a visitor
 *    scanned as progress bars, with the numeral the smallest thing in the
 *    row. The boxes invert that: the score is the largest type in the
 *    block and the category name sits above it in full, so the tile reads
 *    as four results rather than four gauges. It also sits square beside
 *    the card's copy column, which the one-line-per-category list could
 *    not do.
 *
 * Colour still encodes Lighthouse's pass/average/fail bands, because a
 * scoreboard that paints an 88 the same as a 100 is not reporting anything.
 * But the three band colours are the site's, not PageSpeed's: brand blue
 * for a pass, a warm amber for the middle band, a deep magenta-red for a
 * fail. Nothing is upgraded by the swap — 88 still lands in the amber band
 * it lands in on Google's own scale — and the row stops fighting the warm
 * paper palette everything around it is built on.
 */

const CATEGORIES: { key: keyof Scores; label: string }[] = [
  { key: "performance", label: "Performance" },
  { key: "accessibility", label: "Accessibility" },
  { key: "bestPractices", label: "Best Practices" },
  { key: "seo", label: "SEO" },
];

/** Lighthouse's own 90/50 band thresholds, in the site's palette. */
function bandColor(score: number) {
  if (score >= 90) return "var(--blue)";
  if (score >= 50) return "#b45309";
  return "#d4145a";
}

type Size = "sm" | "lg";

/**
 * `box` and `stroke` are the SVG's own coordinate space, not its rendered
 * size — the element is sized by `boxClass` and the viewBox scales to fit.
 * That split is what lets the ring row shrink on a phone: four 108px rings
 * plus gaps are ~430px wide, which overflowed a 375px viewport and pushed
 * the whole case study into a horizontal scroll.
 */
const RING = {
  box: 108,
  stroke: 7,
  boxClass: "h-[clamp(58px,15vw,108px)] w-[clamp(58px,15vw,108px)]",
};

/**
 * One ring. The arc sweeps from empty on scroll-in, which is what makes the
 * row read as the audit *running* rather than as four static badges that
 * happened to fade in.
 *
 * The numeral deliberately does NOT count up with it. Two count-up
 * implementations were tried — a hand-rolled rAF loop and motion's
 * imperative `animate` writing through React state — and both share a
 * failure mode this particular row cannot afford: whenever frames or React
 * renders are starved (a background tab, a throttled renderer, a page being
 * screenshotted for a preview or an OG image), the numeral is stranded at
 * its start value while the ring still paints its full arc. The result is a
 * completed ring reading "0" on the page whose entire argument is that
 * these numbers are real. A static numeral cannot lie in any environment.
 */
function Gauge({
  score,
  label,
  delay,
  reduced,
  inView,
}: {
  score: number;
  label: string;
  delay: number;
  reduced: boolean;
  /** Lifted to the row rather than observed per gauge, so all four arcs
   * sweep off one trigger and the stagger stays in order. */
  inView: boolean;
}) {
  const { box, stroke, boxClass } = RING;
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = bandColor(score);

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className={cn("relative", boxClass)}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${box} ${box}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track — the band colour at low alpha rather than a neutral
              grey, so the ring still reads as one object at a glance. */}
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeOpacity={0.16}
            strokeWidth={stroke}
          />
          <motion.circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: reduced ? circumference * (1 - score / 100) : circumference }}
            animate={{
              strokeDashoffset:
                reduced || inView ? circumference * (1 - score / 100) : circumference,
            }}
            transition={reduced ? { duration: 0 } : { duration: 1, delay, ease: EASE }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xl font-extrabold tabular-nums tracking-tight sm:text-3xl"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {/* Full names, always — the abbreviations that used to carry the
          narrow case ("A11Y", "BEST") saved one line of wrapping and cost
          the row its readability. "Best Practices" wraps to two lines on a
          phone, which is why the columns align to the top. */}
      <span
        className="mt-2 max-w-[9ch] text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-ink-soft sm:max-w-none sm:text-xs"
        aria-hidden="true"
      >
        {label}
      </span>
    </div>
  );
}

/** Ring row — the case study's metrics band. */
function GaugeRow({ scores, reduced, inView }: { scores: Scores; reduced: boolean; inView: boolean }) {
  return (
    <>
      {CATEGORIES.map((c, i) => (
        <div key={c.key} className="flex min-w-0 flex-1 flex-col items-center sm:flex-none">
          {/* Value before term in source order is wrong for a dl, so the
              gauge renders both and these carry the semantics. */}
          <dt className="sr-only">{c.label}</dt>
          <dd className="m-0">
            <Gauge
              score={scores[c.key]}
              label={c.label}
              delay={reduced ? 0 : i * 0.12}
              reduced={reduced}
              inView={inView}
            />
          </dd>
        </div>
      ))}
    </>
  );
}

/**
 * Score boxes — the grid card. A 2x2 block, one bordered box per category:
 * full category name above, the score below in the band colour.
 *
 * Each box carries `.project-card-score` and publishes its band colour as
 * `--band`. The hover itself — lift, border tint, wash, glow, staggered
 * 60ms apart — is defined in globals.css beside the rest of the card's
 * cascade, because it is the last beat of that one move and because
 * Tailwind hover utilities cannot express it here (see the note on
 * .project-card there). The class is inert wherever no `.project-card`
 * ancestor exists, and `size="sm"` exists only for that card.
 *
 * `--band` is a variable rather than four inline colours because border,
 * wash, glow and numeral all need it and only the numeral could be set
 * inline — the other three are hover states.
 *
 * The arc sweep still belongs to the `lg` rings, not here. These are meant
 * to be readable the instant the card enters the viewport; only the hover
 * animates them.
 */
function ScoreBoxes({ scores }: { scores: Scores }) {
  return (
    <>
      {CATEGORIES.map((c) => {
        const score = scores[c.key];
        return (
          <div
            key={c.key}
            style={{ "--band": bandColor(score) } as React.CSSProperties}
            className="project-card-score flex flex-col items-center justify-center rounded-[var(--mp-radius-sm)] border border-line bg-paper px-2 py-3 text-center"
          >
            {/* nowrap, not a wrap-tolerant label: "Best Practices" is the
                only category that breaks, and letting it break made the
                bottom row of every 2x2 taller than the top one, so no two
                scores in a card sat on the same baseline. */}
            <dt className="whitespace-nowrap text-[10px] font-medium leading-none tracking-tight text-ink-soft">
              {c.label}
            </dt>
            <dd className="m-0 mt-1 text-2xl font-extrabold leading-none tabular-nums tracking-tight text-[var(--band)]">
              {score}
            </dd>
          </div>
        );
      })}
    </>
  );
}

export function LighthouseScores({
  scores,
  size = "lg",
  className,
}: {
  scores: Scores;
  size?: Size;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <dl
      ref={ref}
      className={cn(
        size === "lg"
          ? "flex items-start justify-between gap-3 sm:justify-start sm:gap-12"
          : "grid grid-cols-2 gap-2",
        className,
      )}
    >
      {size === "lg" ? (
        <GaugeRow scores={scores} reduced={reduced} inView={inView} />
      ) : (
        <ScoreBoxes scores={scores} />
      )}
    </dl>
  );
}
