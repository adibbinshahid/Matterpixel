"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "motion/react";
import { BrowserFrame } from "@/components/BrowserFrame";
import { easeOutExpo, prefersReducedMotion } from "@/lib/pixels";
import { sweep } from "@/lib/sweep";

export type ConceptBuild = {
  slug: string;
  name: string;
  category: string;
  host: string;
  score: number;
  thumb: string;
  /** Phone capture (390×844 at 2×), shown in the phone carousel. */
  mobile: string;
  full: { src: string; width: number; height: number };
};

const MAX_TILT = 5;
/** Hover scroll speed through the full-page capture, px per second. */
const SCROLL_SPEED = 260;
const COUNT_MS = 1100;
/** Hover intent: a row has to hold the pointer this long to take the
 * stage, so sweeping the cursor down the list doesn't fire four sweeps. */
const HOVER_INTENT_MS = 160;

function Score({ value, play }: { value: number; play: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!play || !node || prefersReducedMotion()) return;
    let id = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / COUNT_MS));
      node.textContent = String(Math.round(value * easeOutExpo(p)));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [play, value]);
  return (
    <span className="flex items-center">
      <span ref={ref} className="font-avenir text-2xl font-extrabold leading-none text-[#0a9150] tabular-nums">
        {value}
      </span>
    </span>
  );
}

/** Ten-pixel meter under the score, one pixel per ten points; the last
 * pixel holds the remainder as partial strength. Pixels light in sequence
 * as the list scrolls in (per-pixel delay inline); static under reduced
 * motion (globals.css). */
function ScoreMeter({ value, play }: { value: number; play: boolean }) {
  return (
    <span className="mt-2 flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, value / 10 - i));
        return (
          <span
            key={i}
            className="concept-meter-pixel"
            style={{ opacity: play ? 0.18 + 0.82 * fill : 0.18, transitionDelay: play ? `${i * 70}ms` : "0ms" }}
          />
        );
      })}
    </span>
  );
}

/**
 * The concept builds as a showcase: one stage playing the selected build
 * in its browser frame, and a compact list of all four beside it. Rows
 * take the stage on hover (with intent), click, or arrow keys, and the
 * stage changes with the same light-edge sweep as the package picker, on
 * the list's own axis — down the list, the new build rises in from the
 * bottom; up the list, it drops in from the top. The
 * stage itself links to the build's case study: hovering or focusing it
 * scrolls the full-page capture inside the frame, and fine pointers tilt
 * it up to 5°. Reduced motion: instant swaps, no tilt, no scroll.
 */
export function ConceptShowcase({ builds }: { builds: ConceptBuild[] }) {
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const edgeRef = useRef<HTMLDivElement>(null);
  const frameEls = useRef<(HTMLDivElement | null)[]>([]);
  const views = useRef<(HTMLDivElement | null)[]>([]);
  const shots = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tiltRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const intent = useRef(0);
  const raf = useRef(0);
  const listSeen = useInView(listRef, { once: true, amount: 0.4 });

  useLayoutEffect(() => {
    if (leaving === null) return;
    const out = frameEls.current[leaving];
    const into = frameEls.current[shown];
    const edge = edgeRef.current;
    if (!out || !into || !edge) return;
    out.style.zIndex = "1";
    into.style.zIndex = "2";
    // Vertical: the list runs top to bottom, so the stage does too.
    const anims = sweep(out, into, edge, dirRef.current, "y");
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
    const next = (i + builds.length) % builds.length;
    if (focus) rowRefs.current[next]?.focus();
    if (next === shown) return;
    scrollShot(shown, false);
    dirRef.current = next > shown ? 1 : -1;
    setLeaving(prefersReducedMotion() ? null : shown);
    setShown(next);
  };

  const scrollShot = (i: number, on: boolean) => {
    const view = views.current[i];
    const shot = shots.current[i];
    if (!view || !shot || prefersReducedMotion()) return;
    const distance = Math.max(0, shot.offsetHeight - view.offsetHeight);
    const ms = on ? Math.min(7000, Math.max(1800, (distance / SCROLL_SPEED) * 1000)) : 700;
    shot.style.transition = `transform ${ms}ms ${on ? "cubic-bezier(0.45,0,0.55,1)" : "cubic-bezier(0.16,1,0.3,1)"}`;
    shot.style.transform = on ? `translateY(-${distance}px)` : "translateY(0)";
  };

  const onStageMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el || e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(1300px) rotateX(${(-y * MAX_TILT).toFixed(2)}deg) rotateY(${(x * MAX_TILT).toFixed(2)}deg)`;
    });
  };

  const onStageLeave = () => {
    cancelAnimationFrame(raf.current);
    if (tiltRef.current) tiltRef.current.style.transform = "";
    scrollShot(shown, false);
  };

  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: shown + 1,
      ArrowRight: shown + 1,
      ArrowUp: shown - 1,
      ArrowLeft: shown - 1,
      Home: 0,
      End: builds.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    select(keys[e.key], true);
  };

  return (
    <div className="mt-10 md:mt-12 lg:mt-14">
      <PhoneCarousel builds={builds} />
      <div className="grid grid-cols-1 items-start gap-8 max-md:hidden lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-stretch lg:gap-12">
        {/* Stage */}
        <div
          data-reveal="block"
          ref={tiltRef}
          onPointerEnter={(e) => e.pointerType === "mouse" && scrollShot(shown, true)}
          onPointerMove={onStageMove}
          onPointerLeave={onStageLeave}
          className="min-w-0 transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
        >
          <BrowserFrame
            url={builds[shown].host}
            className="shadow-[0_40px_80px_-30px_rgba(11,12,14,0.45)]"
            bodyClassName="grid overflow-hidden"
          >
            {builds.map((b, i) => {
              const active = i === shown;
              return (
                <div
                  key={b.slug}
                  ref={(el) => {
                    frameEls.current[i] = el;
                  }}
                  id={`concept-stage-${b.slug}`}
                  role="tabpanel"
                  aria-labelledby={`concept-row-${b.slug}`}
                  aria-hidden={!active}
                  inert={!active}
                  style={{ gridArea: "1 / 1" }}
                  className={`bg-[#0f0f13] ${active || i === leaving ? "visible" : "invisible"}`}
                >
                  <Link
                    href={`/projects/${b.slug}`}
                    aria-label={`${b.name} — open the case study`}
                    onFocus={() => scrollShot(i, true)}
                    onBlur={() => scrollShot(i, false)}
                    className="block focus-visible:outline-offset-[-3px]"
                  >
                    <div
                      ref={(el) => {
                        views.current[i] = el;
                      }}
                      className="relative aspect-[16/10] overflow-hidden"
                    >
                      <div
                        ref={(el) => {
                          shots.current[i] = el;
                        }}
                      >
                        <Image
                          src={b.full.src}
                          alt={`${b.name} — full page`}
                          width={b.full.width}
                          height={b.full.height}
                          loading="lazy"
                          sizes="(min-width: 1024px) 700px, 100vw"
                          className="block h-auto w-full"
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
            <div ref={edgeRef} hidden aria-hidden="true" className="sweep-edge" />
          </BrowserFrame>
        </div>

        {/* List */}
        <div
          ref={listRef}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Concept builds"
          onKeyDown={onListKey}
          className="flex min-w-0 flex-col lg:h-full"
        >
          {builds.map((b, i) => {
            const active = i === shown;
            return (
              <button
                key={b.slug}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                data-reveal="block"
                id={`concept-row-${b.slug}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`concept-stage-${b.slug}`}
                tabIndex={active ? 0 : -1}
                onClick={() => select(i)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  window.clearTimeout(intent.current);
                  intent.current = window.setTimeout(() => select(i), HOVER_INTENT_MS);
                }}
                onPointerLeave={() => window.clearTimeout(intent.current)}
                className={`group relative flex items-center gap-4 rounded-2xl px-3 py-3.5 text-left transition-colors duration-300 lg:min-h-0 lg:flex-1 ${
                  active ? "concept-glass concept-edge" : "border border-transparent hover:bg-white/40"
                }`}
              >
                <span className="relative shrink-0" data-locked={active || undefined}>
                  <span
                    className={`relative block h-12 w-[4.5rem] overflow-hidden rounded-md border transition-[border-color,opacity] duration-300 lg:h-14 lg:w-[5.5rem] ${
                      active ? "border-white/25 opacity-100" : "border-line opacity-60 group-hover:opacity-90"
                    }`}
                  >
                    <Image src={b.thumb} alt="" fill loading="lazy" sizes="72px" className="object-cover object-top" />
                  </span>
                  {(["tl", "tr", "bl", "br"] as const).map((c) => (
                    <span key={c} aria-hidden="true" className={`concept-corner concept-corner-${c}`} />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`flex items-center gap-2 text-lg font-bold tracking-tight transition-colors duration-300 ${
                      active ? "text-ink" : "text-ink-soft group-hover:text-ink"
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 shrink-0 bg-magenta" aria-hidden="true" />}
                    {b.name}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-soft">{b.category}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <Score value={b.score} play={listSeen} />
                  <ScoreMeter value={b.score} play={listSeen} />
                  <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Lighthouse
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Below both columns, so the list can match the frame's height exactly. */}
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
        <span className="h-1.5 w-1.5 bg-magenta" aria-hidden="true" />
        <span className="md:hidden">Concept build · swipe for more, tap to open the case study</span>
        <span className="max-md:hidden [@media(hover:hover)]:hidden">Concept build · tap to open the case study</span>
        <span className="hidden md:[@media(hover:hover)]:inline">
          Concept build · hover to scroll the live page, click to open the case study
        </span>
      </p>
    </div>
  );
}

/**
 * Phones (<768px): the four builds as a swipe row instead of the stage and
 * list. Each card is the build's real phone capture (not the desktop shot
 * scaled down), 85vw wide so the next card peeks in at the edge, snapping
 * one card at a time. Each card opens the case study.
 */
function PhoneCarousel({ builds }: { builds: ConceptBuild[] }) {
  return (
    <ul
      data-reveal="block"
      data-hscroll
      aria-label="Concept builds"
      className="no-scrollbar -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto px-6 pb-2 md:hidden"
    >
      {builds.map((b) => (
        <li key={b.slug} className="w-[85vw] max-w-[340px] shrink-0 snap-start">
          <Link
            href={`/projects/${b.slug}`}
            className="group block overflow-hidden rounded-[22px] border border-line bg-paper shadow-[0_24px_50px_-28px_rgba(11,12,14,0.45)]"
          >
            <span className="relative block aspect-[4/5] overflow-hidden bg-[#0f0f13]">
              <Image
                src={b.mobile}
                alt={`${b.name} on a phone`}
                fill
                loading="lazy"
                sizes="85vw"
                className="object-cover object-top"
              />
            </span>
            <span className="flex items-start gap-3 p-4">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
                  <span className="h-1.5 w-1.5 shrink-0 bg-magenta" aria-hidden="true" />
                  {b.name}
                </span>
                <span className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{b.category}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0a9150]" aria-hidden="true" />
                  <span className="font-avenir text-2xl font-extrabold leading-none text-[#0a9150] tabular-nums">
                    {b.score}
                  </span>
                </span>
                <span className="mt-1 text-xs font-medium text-ink-soft">Lighthouse</span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
