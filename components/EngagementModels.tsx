"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { PixelPager } from "@/components/ui/PixelPager";
import { PixelSection } from "@/components/home/PixelSection";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Hl } from "@/components/home/Hl";
import { engagementModels, engagementModelsIntro } from "@/content/engagementModels";
import { CtaLink } from "@/components/CtaLink";

const LAST = engagementModels.length - 1;
/** Phones show this many ticks per card; the rest open on "See all". */
const PHONE_FEATURES = 2;

/**
 * The engagement models as a commitment spectrum: one line from a single
 * project to an embedded partner, with each model a node on it and a
 * compact column beneath. The layout itself says how the three relate.
 *
 * The active model lights the line from the start up to its node with the
 * page's blue→magenta light, and the other columns step back. Desktop:
 * hover or keyboard focus picks the model (resting on the most popular).
 * Phones: the line runs vertically and the light follows the reader down
 * it, tracking whichever model sits mid-screen. Below 768px the models are
 * swipe cards instead (most popular first, snapping one at a time) and the
 * card in view is the active one. Reduced motion: the same states without
 * the travel.
 */
export function EngagementModels({ firstSection = false }: { firstSection?: boolean }) {
  const featured = engagementModels.findIndex((m) => m.featured);
  const [hovered, setHovered] = useState<number | null>(null);
  // Keyboard focus shows on the glass plate (a ring), not as an outline
  // around the whole column cutting across the spectrum line.
  const [kbd, setKbd] = useState(false);
  const [scrolled, setScrolled] = useState(featured);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const rowRef = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLDivElement | null)[]>([]);
  const bodies = useRef<(HTMLDivElement | null)[]>([]);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Measured node-to-node line: its box, orientation, and where each node
  // falls along it (0–1). Measured rather than assumed, because on phones
  // the gaps follow each column's text length.
  const [line, setLine] = useState<{ style: CSSProperties; vertical: boolean; stops: number[] } | null>(null);
  // Each column's box, for the glass plate that slides behind the active one.
  const [boxes, setBoxes] = useState<{ x: number; y: number; w: number; h: number }[]>([]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    // Layout offsets, not bounding rects: the section's entrance animation
    // scales this block while it's staged, and rects would carry that.
    const offsetIn = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      let node: HTMLElement | null = el;
      while (node && node !== wrap) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    const measure = () => {
      const pts = nodes.current.map((n) => {
        const o = offsetIn(n!);
        return { x: o.x + n!.offsetWidth / 2, y: o.y + n!.offsetHeight / 2 };
      });
      const first = pts[0];
      const last = pts[pts.length - 1];
      const vertical = Math.abs(last.x - first.x) < 4;
      const len = vertical ? last.y - first.y : last.x - first.x;
      setLine({
        vertical,
        style: vertical
          ? { left: first.x, top: first.y, height: len, width: 1 }
          : { left: first.x, top: first.y, width: len, height: 1 },
        stops: pts.map((p) => (len ? (vertical ? p.y - first.y : p.x - first.x) / len : 0)),
      });
      setBoxes(
        bodies.current.map((c) => {
          const o = offsetIn(c!);
          return { x: o.x, y: o.y, w: c!.offsetWidth, h: c!.offsetHeight };
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Phones: the model crossing the middle of the screen is the active one —
  // or, below 768px where they're swipe cards, the card in view.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) return;
    if (window.matchMedia("(max-width: 767px)").matches) {
      const swipe = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) setScrolled(cols.current.indexOf(e.target as HTMLDivElement));
          }
        },
        { root: rowRef.current, threshold: 0.6 },
      );
      cols.current.forEach((c) => c && swipe.observe(c));
      return () => swipe.disconnect();
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setScrolled(cols.current.indexOf(e.target as HTMLDivElement));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    cols.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  const active = hovered ?? scrolled;
  const dimOthers = hovered !== null;
  const progress = line?.stops[active] ?? (LAST ? active / LAST : 0);

  return (
    <PixelSection
      seam
      className={`${firstSection ? "pb-[72px] pt-32 lg:pb-[120px] lg:pt-40" : "home-section"}`}
      labelledBy="engagement-title"
    >
      <div className="home-shell">
        {/* The CTA sits beside the heading (from md) rather than in a row
            under the plans, so the whole section fits one screen. Phones
            drop it: the sticky bar carries the same call. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <SectionHeading
            id="engagement-title"
            eyebrow={engagementModelsIntro.eyebrow}
            title={
              <>
                Choose the way we <Hl tone="magenta">build together</Hl>.
              </>
            }
            lede={engagementModelsIntro.body}
            className="md:max-w-none"
          />
          <div data-reveal="lede" className="flex shrink-0 flex-col items-start gap-2 max-sm:hidden md:items-end">
            <CtaLink section="engagement" cta="book" />
            <p className="text-sm text-ink-soft">Not sure which fits? We&rsquo;ll recommend one.</p>
          </div>
        </div>

        <div
          data-reveal="block"
          ref={wrapRef}
          className="relative mt-6 md:mt-8 lg:mt-10 short:lg:mt-6"
          onMouseLeave={() => setHovered(null)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(null);
          }}
        >
          {/* The line. Desktop: across the top of the columns, node to
              node. Phones: down the left edge. The lit part runs from the
              first node to the active one. */}
          {/* Glass plate behind the active model: one element that glides
              between columns on the same curve as the light, frosting the
              drifting grid behind it. */}
          {boxes[active] && (
            <div
              aria-hidden="true"
              data-focus={kbd || undefined}
              className="spectrum-plate max-md:hidden"
              style={{
                transform: `translate3d(${boxes[active].x}px, ${boxes[active].y}px, 0)`,
                width: boxes[active].w,
                height: boxes[active].h,
              }}
            />
          )}

          {line && (
            <div aria-hidden="true" className="spectrum-track max-md:hidden" data-vertical={line.vertical} style={line.style}>
              <div className="spectrum-fill" style={{ ["--p" as string]: progress }} />
            </div>
          )}

          {/* Desktop: one shared row grid (subgrid) for all three columns, so
              every row — stage, name, price, note, description, ticks —
              lines up across the models and the three plates are the same
              size. */}
          <div
            ref={rowRef}
            id="engagement-row"
            data-hscroll
            className="no-scrollbar grid gap-8 pl-6 max-md:-mx-6 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-6 max-md:gap-3 max-md:overflow-x-auto max-md:overflow-y-hidden max-md:overscroll-x-contain max-md:px-6 max-md:-my-6 max-md:py-6 md:grid-cols-3 md:grid-rows-[repeat(6,auto)] md:gap-x-8 md:gap-y-0 md:pl-0 lg:gap-x-16"
          >
            {engagementModels.map((m, i) => {
              const isActive = i === active;
              const reached = i <= active;
              return (
                <div
                  key={m.title}
                  ref={(el) => {
                    cols.current[i] = el;
                  }}
                  onMouseEnter={() => {
                    setKbd(false);
                    setHovered(i);
                  }}
                  onFocus={(e) => {
                    setKbd(e.currentTarget.matches(":focus-visible"));
                    setHovered(i);
                  }}
                  tabIndex={0}
                  aria-label={`${m.title}: ${m.anchor}`}
                  className={`group relative z-10 transition-opacity duration-200 focus-visible:outline-none motion-reduce:transition-none max-md:w-[85vw] max-md:max-w-[340px] max-md:shrink-0 max-md:snap-start max-md:rounded-[22px] grid-box-phone max-md:p-4 ${
                    isActive ? "max-md:border-magenta" : "max-md:border-line"
                  } md:row-span-6 md:grid md:grid-rows-subgrid ${
                    dimOthers && !isActive ? "opacity-45" : "opacity-100"
                  }`}
                >
                  {/* Node + stage label */}
                  <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-4 short:lg:flex-row short:lg:items-center short:lg:gap-3">
                    <span
                      ref={(el) => {
                        nodes.current[i] = el;
                      }}
                      aria-hidden="true"
                      className={`relative z-10 -ml-[calc(1.5rem+6px)] block h-3 w-3 max-md:ml-0 shrink-0 transition-[background-color,box-shadow,border-color] duration-200 motion-reduce:transition-none md:ml-0 ${
                        isActive
                          ? "border border-magenta bg-magenta shadow-[0_0_0_4px_rgba(255,46,147,0.25),0_0_18px_rgba(255,46,147,0.7)]"
                          : reached
                            ? "border border-[var(--blue-ink)] bg-blue"
                            : "border border-white/30 bg-paper"
                      }`}
                    />
                    <span className="flex items-center gap-2.5 md:mt-1 short:lg:mt-0">
                    <span
                      className={`text-[0.8125rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-200 md:text-xs ${
                        isActive ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {m.stage}
                    </span>
                    {m.featured && (
                      <span className="whitespace-nowrap rounded-full bg-magenta px-2.5 py-1 text-xs font-extrabold uppercase leading-none tracking-[0.12em] text-white max-lg:hidden">
                        {m.tag}
                      </span>
                    )}
                    </span>
                  </div>

                  {/* The model's content — what the glass plate frames. Its
                      padding is pulled back out with negative margins so the
                      text stays aligned with the node and stage label. */}
                  <div
                    ref={(el) => {
                      bodies.current[i] = el;
                    }}
                    className="max-md:mt-2 md:row-span-5 md:-mx-4 md:mt-3 md:grid md:grid-rows-subgrid md:p-4 lg:-mx-6 lg:p-6 short:lg:mt-2 short:lg:p-4"
                  >
                    <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-lg font-bold tracking-tight text-ink lg:text-xl">
                      {m.title}
                      {m.featured && (
                        <span className="whitespace-nowrap rounded-full bg-magenta px-2.5 py-1 text-xs font-extrabold uppercase leading-none tracking-[0.12em] text-white lg:hidden">
                          {m.tag}
                        </span>
                      )}
                    </h3>
                    <p
                      className={`mt-2 font-avenir text-[1.75rem] font-extrabold leading-none tracking-tight lg:mt-3 lg:text-[2rem] transition-colors duration-200 ${
                        isActive ? "text-magenta" : "text-ink/85"
                      }`}
                    >
                      {m.anchor}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-ink-soft lg:mt-2">{m.anchorNote}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft max-md:line-clamp-3 lg:mt-4 lg:text-base short:lg:mt-3 short:lg:line-clamp-2 short:lg:text-sm">{m.desc}</p>
                    <ul className="mt-3 flex flex-col gap-1.5 self-start border-t border-line pt-3 lg:mt-4 lg:gap-2 lg:pt-4 short:lg:mt-3 short:lg:gap-1.5 short:lg:pt-3">
                      {m.features.map((f, k) => (
                        <li
                          key={f}
                          className={`flex items-start gap-2.5 text-sm leading-snug text-ink lg:text-base short:lg:text-sm ${
                            k >= PHONE_FEATURES && !expanded[i] ? "max-md:hidden" : ""
                          }`}
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 transition-colors duration-200 ${
                              isActive ? "text-magenta" : "text-ink-soft"
                            }`}
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {m.features.length > PHONE_FEATURES && (
                      <button
                        type="button"
                        aria-expanded={!!expanded[i]}
                        onClick={() => setExpanded((x) => ({ ...x, [i]: !x[i] }))}
                        className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-ink underline underline-offset-4 md:hidden"
                      >
                        {expanded[i] ? "Show less" : `See all ${m.features.length}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <PixelPager
            count={engagementModels.length}
            index={scrolled}
            onSelect={(i) => {
              const row = rowRef.current;
              const col = cols.current[i];
              if (row && col) row.scrollTo({ left: row.scrollLeft + col.getBoundingClientRect().left - row.getBoundingClientRect().left - 24, behavior: "smooth" });
            }}
            controls="engagement-row"
            itemLabel="engagement model"
            className="-mb-2 md:hidden"
          />
        </div>

      </div>
    </PixelSection>
  );
}
