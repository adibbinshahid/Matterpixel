"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { stats } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DURATIONS, EASE } from "@/lib/utils";

// 2x the site's normal pace, on request — this section's reveal and
// count-up both read as noticeably slower/more deliberate than everywhere
// else on the site.
const REVEAL_DURATION = DURATIONS.standard * 2;
const COUNT_UP_DURATION = 2.2 * 2;

/** Splits "90+" / "100%" / "24h" into an animatable number + trailing
 * suffix; non-numeric values ("NDA") count-up as a no-op and just render. */
function parseStat(value: string): { num: number | null; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { num: null, suffix: "" };
  return { num: Number(match[1]), suffix: match[2] };
}

function StatTile({ stat }: { stat: (typeof stats)[number] }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { num, suffix } = parseStat(stat.value);
  const [display, setDisplay] = useState(reduced || num === null ? num ?? 0 : 0);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  // Re-plays every time the tile re-enters view (scroll away and back
  // replays the count-up), not just once — no `once`/"already animated"
  // guard, unlike most reveals on this site.
  useEffect(() => {
    const el = ref.current;
    if (!el || num === null || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        controlsRef.current?.stop();
        setDisplay(0);
        controlsRef.current = animate(0, num, {
          duration: COUNT_UP_DURATION,
          ease: EASE,
          onUpdate: (latest) => setDisplay(Math.round(latest)),
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      controlsRef.current?.stop();
    };
  }, [num, reduced]);

  return (
    <RevealItem className="stat-divider pt-6" duration={REVEAL_DURATION}>
      <div ref={ref}>
        <p
          className={
            stat.value.length > 6
              ? "break-words text-3xl font-bold leading-tight tracking-tight text-paper sm:text-4xl"
              : "break-words text-display text-paper"
          }
        >
          {num === null ? stat.value : `${display}${suffix}`}
        </p>
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.08em] text-paper">{stat.label}</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper/75">{stat.desc}</p>
      </div>
    </RevealItem>
  );
}

export function Stats() {
  return (
    <section className="bg-blue">
      <div className="section-shell section-py-standard">
        <RevealGroup className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <StatTile key={stat.label} stat={stat} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
