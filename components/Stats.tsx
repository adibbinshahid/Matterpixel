"use client";

import { stats } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Bottom seam (Stats -> ServicesFold): the same hairline grid texture
 * ServicesFold draws behind its own cards, mask-faded to transparent
 * going up — its actual pattern bleeding into this section, not a flat
 * color standing in for it.
 */
function ServicesBleed() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-32 overflow-hidden"
      style={{ maskImage: "linear-gradient(to top, black, transparent)", WebkitMaskImage: "linear-gradient(to top, black, transparent)" }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#0b0b0d]/70" />
      <div className="services-grid-bg absolute inset-0 opacity-70" />
    </div>
  );
}

/** Compact chip, not the old tall card — number + label side by side, no
 * desc paragraph (a marquee's items are read at a glance while passing by,
 * not lingered on). */
function StatChip({ stat }: { stat: (typeof stats)[number] }) {
  return (
    <div className="glass-card flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-5 py-3">
      <span className="text-2xl font-bold leading-none tracking-tight text-paper sm:text-3xl">{stat.value}</span>
      <span className="text-xs font-semibold uppercase leading-tight tracking-[0.08em] text-paper/75">
        {stat.label}
      </span>
    </div>
  );
}

/**
 * Infinite marquee row — the track renders the stat list twice back to
 * back and animates `translateX(0 -> -50%)` (see `marquee` keyframes,
 * app/globals.css): since both halves are identical, the moment the first
 * half has scrolled fully offscreen the second half is sitting exactly
 * where the first one started, so the loop point is invisible. `reverse`
 * just flips the same keyframes' playback direction (-50% -> 0) rather
 * than needing a second keyframe — that's the row that reads right-to-left
 * vs its neighbor's left-to-right.
 */
function MarqueeRow({ reverse, duration }: { reverse?: boolean; duration: number }) {
  const reduced = useReducedMotion();
  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        className="flex w-max shrink-0 gap-4"
        style={reduced ? undefined : { animation: `marquee ${duration}s linear infinite${reverse ? " reverse" : ""}` }}
      >
        {[...stats, ...stats].map((stat, i) => (
          <StatChip key={i} stat={stat} />
        ))}
      </div>
    </div>
  );
}

export function Stats() {
  return (
    <section className="relative overflow-hidden bg-blue py-10 sm:py-12" data-nav-scrim="light">
      {/* Softens the hard cut on the bottom edge of this solid blue section —
         ServicesFold's own actual grid graphic crossfading inward, not a
         flat color standing in for it. */}
      <ServicesBleed />
      <div className="flex flex-col gap-4">
        <MarqueeRow duration={38} />
        <MarqueeRow duration={34} reverse />
      </div>
    </section>
  );
}
