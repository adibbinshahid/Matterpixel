"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "motion/react";
import { ArrowUpRight } from "lucide-react";
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

function Score({ value, play, small = false }: { value: number; play: boolean; small?: boolean }) {
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
      <span ref={ref} className={`font-avenir font-extrabold ${small ? "text-xs" : "text-2xl"} leading-none text-[#0a9150] tabular-nums`}>
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
    <div className="mt-6 md:mt-10 lg:mt-8 short:lg:mt-6">
      {/* Below md there's no room for a viewer: a 2×2 grid of thumbnail
          cards, each opening its case study. From md: stage left, list
          right (compact rows sized to the frame on tablets). */}
      <ThumbGrid builds={builds} />
      <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-stretch gap-6 max-md:hidden lg:gap-12 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
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
                      className="relative aspect-[16/10] overflow-hidden short:lg:aspect-[16/9]"
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
          className="flex h-full min-w-0 flex-col"
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
                className={`group relative flex min-h-0 flex-1 text-left transition-colors duration-300 items-center gap-4 rounded-2xl px-4 py-3 lg:px-3 lg:py-3.5 ${
                  active ? "concept-glass concept-edge" : "border border-transparent hover:bg-white/40"
                }`}
              >
                <span className="relative shrink-0 max-lg:hidden" data-locked={active || undefined}>
                  <span
                    className={`relative block overflow-hidden rounded-md border transition-[border-color,opacity] duration-300 h-14 w-[5.5rem] ${
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
                    className={`flex items-center gap-2 overflow-hidden whitespace-nowrap text-base font-bold leading-tight tracking-tight transition-colors duration-300 lg:text-lg ${
                      active ? "text-ink" : "text-ink-soft group-hover:text-ink"
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 shrink-0 bg-magenta" aria-hidden="true" />}
                    {b.name}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-ink-soft">
                    <span className="lg:hidden">{b.category.split(" · ")[0]}</span>
                    <span className="max-lg:hidden">{b.category}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  <Score value={b.score} play={listSeen} />
                  <ScoreMeter value={b.score} play={listSeen} />
                  <span className="mt-1.5 text-[10px] max-lg:hidden font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Lighthouse
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Below both columns, so the list can match the frame's height exactly. */}
      <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft max-md:hidden short:lg:hidden">
        <span className="h-1.5 w-1.5 bg-magenta" aria-hidden="true" />
        <span className="[@media(hover:hover)]:hidden">Concept build · tap to open the case study</span>
        <span className="hidden [@media(hover:hover)]:inline">
          Concept build · hover to scroll the live page, click to open the case study
        </span>
      </p>
    </div>
  );
}

/**
 * Below md: the four builds as a 2×2 grid of thumbnail cards — the build's
 * desktop capture, its name and category, and its Lighthouse score —
 * each opening the case study. No viewer: at this width it would crowd
 * the section past one screen.
 */
function ThumbGrid({ builds }: { builds: ConceptBuild[] }) {
  const gridRef = useRef<HTMLUListElement>(null);
  const play = useInView(gridRef, { once: true, amount: 0.4 });
  return (
    <ul ref={gridRef} data-reveal="block" aria-label="Concept builds" className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:hidden">
      {builds.map((b) => (
        <li key={b.slug}>
          <Link
            href={`/projects/${b.slug}`}
            className="group block overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_18px_40px_-26px_rgba(11,12,14,0.45)] transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-[var(--blue-ink)]"
          >
            {/* The desktop capture at its own 16:10, uncropped: the build as
                its homepage actually looks, not a phone shot cut to fit. */}
            <span className="relative block aspect-[16/10] overflow-hidden bg-[#0f0f13]">
              <Image
                src={b.thumb}
                alt={`${b.name} homepage`}
                fill
                loading="lazy"
                sizes="(min-width: 640px) 360px, 100vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0a9150]" aria-hidden="true" />
                <Score value={b.score} play={play} small />
              </span>
            </span>
            <span className="flex items-start gap-2 p-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold tracking-tight text-ink">{b.name}</span>
                <span className="mt-0.5 block truncate text-xs text-ink-soft">{b.category.split(" · ")[0]}</span>
              </span>
              <ArrowUpRight
                className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                aria-hidden="true"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
