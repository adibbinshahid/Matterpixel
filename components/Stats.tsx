"use client";

import { stats } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Compact chip — number + label side by side, no desc paragraph: a
 * marquee's items are read at a glance while passing by. Sized so labels
 * stay legible on a phone while three or four chips still fit across. */
function StatChip({ stat }: { stat: (typeof stats)[number] }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl border border-line bg-paper-2 px-3.5 py-2 sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-3">
      <span className="font-avenir text-lg font-extrabold leading-none tracking-tight text-ink sm:text-2xl">{stat.value}</span>
      <span className="text-[0.8125rem] font-semibold uppercase leading-tight tracking-[0.1em] text-ink-soft md:text-xs">
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
      // Percentage stops: 8% is ~110px of fade on a desktop row but only
      // ~31px on a 393px phone, which isn't enough runway to hide a chip
      // being cut — chips read as sliced off at both edges rather than
      // fading out. A px-based stop gives every viewport the same real fade
      // distance, which on a phone is proportionally much wider.
      style={{
        maskImage: "linear-gradient(to right, transparent, black 72px, black calc(100% - 72px), transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 72px, black calc(100% - 72px), transparent)",
      }}
    >
      <div
        className="flex w-max shrink-0 gap-2 sm:gap-4"
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
    <section className="relative overflow-hidden py-12 sm:py-16" data-nav-scrim="light" aria-label="Track record">
      {/* Brand-blue band behind the marquee: full strength through the chip
          rows, fading out above and below into the grid ground, so it
          lifts the strip without a hard edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(44,75,255,0)_0%,rgba(44,75,255,0.85)_32%,rgba(44,75,255,0.85)_68%,rgba(44,75,255,0)_100%)]"
      />
      <div className="relative flex flex-col gap-3 sm:gap-4">
        <MarqueeRow duration={38} />
        <MarqueeRow duration={34} reverse />
      </div>
    </section>
  );
}
