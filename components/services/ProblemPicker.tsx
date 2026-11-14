"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Clock, Gauge, Images } from "lucide-react";
import { motion, useInView } from "motion/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Hl } from "@/components/home/Hl";
import { prefersReducedMotion } from "@/lib/pixels";
import { SWEEP_MS, sweep } from "@/lib/sweep";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CtaLink } from "@/components/CtaLink";
import { usd, type ProblemPackage, type Stat } from "@/content/packages";

export type ResolvedProof = {
  href: string;
  name: string;
  cover: string;
  metric: { value: string; label: string };
};

const COUNT_MS = 900;

/**
 * Counts 0 → value when `play` turns true. Renders the final value until
 * then (server HTML and no-JS included), and under reduced motion never
 * animates at all. Tabular numerals keep the digits from jittering while
 * they run.
 */
function CountUp({ stat, play }: { stat: Stat; play: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const decimals = stat.decimals ?? 0;

  // Written straight to the node rather than through state: a 900ms
  // count would otherwise re-render the whole panel ~55 times.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!play || reduced) {
      node.textContent = stat.value.toFixed(decimals);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      // rAF's timestamp can land a hair before `start`, so clamp at 0 too —
      // otherwise the first frame renders "-0.1".
      const p = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
      const eased = 1 - Math.pow(1 - p, 3);
      node.textContent = (stat.value * eased).toFixed(decimals);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduced, stat.value, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {stat.value.toFixed(decimals)}
    </span>
  );
}

function StatTile({ stat, tone, play }: { stat: Stat; tone: "before" | "after"; play: boolean }) {
  const after = tone === "after";
  return (
    <div
      className={`flex min-w-0 flex-col justify-center rounded-2xl p-4 sm:p-5 md:h-full ${
        after ? "bg-blue text-white shadow-[0_18px_40px_-18px_rgba(44,75,255,0.7)]" : "border border-line bg-paper"
      }`}
    >
      <span className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${after ? "text-white/90" : "text-ink-soft"}`}>
        {after ? "After" : "Before"}
      </span>
      <span
        data-m="roll"
        data-i="4"
        className={`mt-2 block font-avenir text-3xl font-extrabold leading-none tracking-tight sm:text-4xl ${
          after ? "text-white" : "text-ink-soft"
        }`}
      >
        <CountUp stat={stat} play={play} />
        <span className="ml-0.5 text-base font-bold sm:text-lg">{stat.unit}</span>
      </span>
      <span className={`mt-1.5 text-xs ${after ? "text-white/90" : "text-ink-soft"}`}>{stat.label}</span>
    </div>
  );
}

/**
 * One fixed slot for the before/after visual from md up, whatever the
 * package shows in it (two stat tiles or the photo). Every package panel
 * then lays out to the same height, so switching packages never changes
 * the card's size.
 */
const SLOT_H = "md:h-52";

function BeforeAfter({ pkg, play }: { pkg: ProblemPackage; play: boolean }) {
  const ba = pkg.beforeAfter;
  if (ba.kind === "image") {
    return (
      <figure>
        <div data-m="swap" data-i="3" className={`relative aspect-video overflow-hidden rounded-2xl border border-line md:aspect-auto ${SLOT_H}`}>
          <Image
            src={ba.src}
            alt={ba.alt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover object-[50%_38%]"
          />
        </div>
        <figcaption data-m="roll" data-i="5" className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="text-ink-soft">{ba.before}</span>
          <ArrowRight className="h-4 w-4 text-magenta" aria-hidden="true" />
          <span>{ba.after}</span>
        </figcaption>
      </figure>
    );
  }
  return (
    <div>
      <div data-m="fade" data-k="ba-tiles" data-i="3" className={`grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 ${SLOT_H}`}>
        <StatTile stat={ba.before} tone="before" play={play} />
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-magenta text-white" aria-hidden="true">
          <ArrowRight className="h-4 w-4" />
        </span>
        <StatTile stat={ba.after} tone="after" play={play} />
      </div>
      <p data-m="fade" data-k="ba-cap" data-i="5" className="mt-2.5 text-sm text-ink-soft">
        Typical before → after for this package.
      </p>
    </div>
  );
}

function ProofCard({ proof }: { proof: ResolvedProof }) {
  return (
    <Link
      href={proof.href}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-paper p-3 pr-4 transition-colors duration-300 hover:border-[var(--blue-ink)]"
    >
      <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-paper-2">
        <Image src={proof.cover} alt="" fill loading="lazy" sizes="80px" className="object-cover object-top" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold text-ink-soft">Live concept build</span>
        <span className="truncate text-base font-bold text-ink">{proof.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-soft">
          {proof.metric.label === "Lighthouse performance" ? (
            <Gauge className="h-3.5 w-3.5 text-[#0cce6b]" aria-hidden="true" />
          ) : (
            <Images className="h-3.5 w-3.5 text-[var(--blue-ink)]" aria-hidden="true" />
          )}
          <span className="font-bold text-ink">{proof.metric.value}</span> {proof.metric.label}
        </span>
      </span>
      <ArrowUpRight
        className="h-4 w-4 shrink-0 text-ink-soft transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink"
        aria-hidden="true"
      />
    </Link>
  );
}

function PackagePanel({
  pkg,
  proof,
  shown,
  leaving,
  play,
  tabId,
  panelId,
  level,
  panelRef,
}: {
  panelRef: (el: HTMLDivElement | null) => void;
  pkg: ProblemPackage;
  proof?: ResolvedProof;
  shown: boolean;
  /** Painted but inert: the outgoing package during a switch. */
  leaving: boolean;
  play: boolean;
  tabId: string;
  panelId: string;
  level: 2 | 3;
}) {
  // Headings step down from the section heading (h1 at the top of
  // /services, h2 on the homepage) so the outline never skips.
  const Title = level === 2 ? "h2" : "h3";
  const Sub = level === 2 ? "h3" : "h4";
  return (
    <div
      ref={panelRef}
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      // All four panels share one grid cell, so the card is always as tall
      // as the tallest package and never changes size on a switch. The
      // inactive ones are invisible (out of the tab order and the
      // accessibility tree) and inert.
      aria-hidden={!shown}
      inert={!shown}
      style={{ gridArea: "1 / 1" }}
      className={`grid gap-8 bg-paper-2 p-6 sm:p-8 md:grid-cols-[1.05fr_1fr] md:gap-10 lg:gap-12 lg:p-10 ${
        shown || leaving ? "visible" : "invisible"
      }`}
    >
      <div className="flex min-w-0 flex-col">
        <Title data-m="roll" data-i="0" className="text-balance text-2xl font-bold leading-[1.12] tracking-tight text-ink sm:text-3xl">
          {pkg.headline}
        </Title>

        <p data-m="roll" data-i="1" className="mt-3 flex items-center gap-2 text-sm font-bold text-magenta">
          <span className="h-1.5 w-1.5 bg-magenta" aria-hidden="true" />
          {pkg.name} package
        </p>

        <div data-m="roll" data-i="2" className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink">
            <Clock className="h-3.5 w-3.5 text-[var(--blue-ink)]" aria-hidden="true" />
            {pkg.timeline}
          </span>
          <p className="text-base text-ink-soft">
            From <span className="font-avenir text-xl font-extrabold text-ink">{usd(pkg.priceFrom)}</span> · fixed quote
          </p>
        </div>

        <div data-m="fade" data-k="cta" data-i="3" className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink cta="quote" params={{ package: pkg.slug }} />
          <CtaLink cta="book" variant="text" className="text-ink" />
        </div>

        {proof && (
          <div data-m="swap" data-i="4" className="mt-7">
            <ProofCard proof={proof} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-7">
        <BeforeAfter pkg={pkg} play={play} />
        <div>
          <Sub data-m="fade" data-k="wyg" data-i="5" className="text-sm font-bold text-ink-soft">
            What you get
          </Sub>
          <ul className="mt-3 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
            {pkg.items.map((item, idx) => (
              <li
                key={item}
                data-m="roll"
                data-i={6 + Math.floor(idx / 2)}
                className="flex items-start gap-3 text-base leading-snug text-ink"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue/20 text-[var(--blue-ink)]">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Part 1 of the service finder. The chips are a WAI-ARIA tablist: arrow
 * keys, Home and End move between them and select as they go; a single
 * blue pill slides between them as the selection moves.
 *
 * The card is sized by its tallest package, so a switch never moves the
 * page. A choice made mid-sweep takes over from there in its own
 * direction. Reduced motion swaps instantly (the pill too, via the site's
 * MotionConfig).
 */
export function ProblemPicker({
  packages,
  proofs,
  firstSection = false,
}: {
  packages: ProblemPackage[];
  proofs: Record<string, ResolvedProof>;
  firstSection?: boolean;
}) {
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const edgeRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelEls = useRef<(HTMLDivElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const seen = useInView(cardRef, { once: true, amount: 0.35 });

  // Runs after the swap commits and before it paints, so the first
  // painted frame is already the first frame of the morph.
  useLayoutEffect(() => {
    if (leaving === null) return;
    const out = panelEls.current[leaving];
    const into = panelEls.current[shown];
    const edge = edgeRef.current;
    if (!out || !into || !edge) return;
    out.style.zIndex = "1";
    into.style.zIndex = "2";
    const anims = sweep(out, into, edge, dirRef.current);
    let live = true;
    Promise.all(anims.map((a) => a.finished))
      .then(() => live && setLeaving(null))
      .catch(() => undefined);
    return () => {
      live = false;
      anims.forEach((a) => a.cancel());
      edge.hidden = true;
      out.style.zIndex = "";
      into.style.zIndex = "";
    };
  }, [shown, leaving]);

  const select = (i: number, focus = false) => {
    const next = (i + packages.length) % packages.length;
    if (focus) tabRefs.current[next]?.focus();
    if (next === shown) return;
    dirRef.current = next > shown ? 1 : -1;
    setLeaving(prefersReducedMotion() ? null : shown);
    setShown(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: shown + 1,
      ArrowDown: shown + 1,
      ArrowLeft: shown - 1,
      ArrowUp: shown - 1,
      Home: 0,
      End: packages.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select(keys[e.key], true);
  };

  return (
    <div className="home-shell">
      <SectionHeading
        as={firstSection ? "h1" : "h2"}
        eyebrow="Start with the problem"
        title={
          <>
            What’s <Hl tone="magenta">slowing</Hl> your <Hl tone="blue">business</Hl>?
          </>
        }
      />

      <div
        role="tablist"
        data-reveal="block"
        aria-label="Pick the problem closest to yours"
        onKeyDown={onKeyDown}
        className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4"
      >
        {packages.map((pkg, i) => {
          const isSelected = i === shown;
          return (
            <button
              key={pkg.slug}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`problem-tab-${pkg.slug}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`problem-panel-${pkg.slug}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(i)}
              className={`relative min-h-11 rounded-full border px-4 py-2.5 text-center text-base font-semibold transition-[color,border-color] duration-300 sm:px-5 ${
                isSelected
                  ? "border-transparent text-white"
                  : "border-line bg-white/[0.03] text-ink-soft hover:border-white/30 hover:text-ink"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="problem-chip-pill"
                  aria-hidden="true"
                  className="absolute inset-0 z-0 rounded-full bg-blue shadow-[0_10px_28px_-10px_rgba(44,75,255,0.8)]"
                  // Same curve and length as the panel sweep, so the chip
                  // and the card move as one shot.
                  transition={{ duration: SWEEP_MS / 1000, ease: [0.77, 0, 0.175, 1] }}
                />
              )}
              {/* z-10: the sliding pill passes beneath every chip's label,
                  not over the ones it travels across. */}
              <span className="relative z-10">{pkg.problem}</span>
            </button>
          );
        })}
      </div>

      <div ref={cardRef} data-reveal="block" className="relative mt-8 grid overflow-hidden rounded-[28px] border border-line bg-paper-2">
        {packages.map((pkg, i) => (
          <PackagePanel
            key={pkg.slug}
            panelRef={(el) => {
              panelEls.current[i] = el;
            }}
            pkg={pkg}
            proof={proofs[pkg.slug]}
            shown={i === shown}
            leaving={i === leaving}
            play={seen && i === shown}
            tabId={`problem-tab-${pkg.slug}`}
            panelId={`problem-panel-${pkg.slug}`}
            level={firstSection ? 2 : 3}
          />
        ))}
        <div ref={edgeRef} hidden aria-hidden="true" className="sweep-edge" />
      </div>
    </div>
  );
}
