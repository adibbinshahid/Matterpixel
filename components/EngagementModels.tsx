"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { PixelSection } from "@/components/home/PixelSection";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Hl } from "@/components/home/Hl";
import { engagementModels, engagementModelsIntro } from "@/content/engagementModels";
import { CtaLink } from "@/components/CtaLink";

const LAST = engagementModels.length - 1;

/**
 * The engagement models as a commitment spectrum: one line from a single
 * project to an embedded partner, with each model a node on it and a
 * compact column beneath. The layout itself says how the three relate.
 *
 * The active model lights the line from the start up to its node with the
 * page's blue→magenta light, and the other columns step back. Desktop:
 * hover or keyboard focus picks the model (resting on the most popular).
 * Phones: the line runs vertically and the light follows the reader down
 * it, tracking whichever model sits mid-screen. Reduced motion: the same
 * states without the travel.
 */
export function EngagementModels({ firstSection = false }: { firstSection?: boolean }) {
  const featured = engagementModels.findIndex((m) => m.featured);
  const [hovered, setHovered] = useState<number | null>(null);
  // Keyboard focus shows on the glass plate (a ring), not as an outline
  // around the whole column cutting across the spectrum line.
  const [kbd, setKbd] = useState(false);
  const [scrolled, setScrolled] = useState(featured);
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

  // Phones: the model crossing the middle of the screen is the active one.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) return;
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
      className={`${firstSection ? "pb-[72px] pt-32 lg:pb-[120px] lg:pt-40" : "py-16 lg:py-20"}`}
      labelledBy="engagement-title"
    >
      <div className="home-shell">
        <SectionHeading
          id="engagement-title"
          eyebrow={engagementModelsIntro.eyebrow}
          title={
            <>
              Choose the way we <Hl tone="magenta">build together</Hl>.
            </>
          }
          lede={engagementModelsIntro.body}
          wideLede
        />

        <div
          data-reveal="block"
          ref={wrapRef}
          className="relative mt-10 lg:mt-12"
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
              className="spectrum-plate"
              style={{
                transform: `translate3d(${boxes[active].x}px, ${boxes[active].y}px, 0)`,
                width: boxes[active].w,
                height: boxes[active].h,
              }}
            />
          )}

          {line && (
            <div aria-hidden="true" className="spectrum-track" data-vertical={line.vertical} style={line.style}>
              <div className="spectrum-fill" style={{ ["--p" as string]: progress }} />
            </div>
          )}

          {/* Desktop: one shared row grid (subgrid) for all three columns, so
              every row — stage, name, price, note, description, ticks —
              lines up across the models and the three plates are the same
              size. */}
          <div className="grid gap-8 pl-6 lg:grid-cols-3 lg:grid-rows-[repeat(6,auto)] lg:gap-x-16 lg:gap-y-0 lg:pl-0">
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
                  className={`group relative z-10 transition-opacity duration-200 focus-visible:outline-none motion-reduce:transition-none lg:row-span-6 lg:grid lg:grid-rows-subgrid ${
                    dimOthers && !isActive ? "opacity-45" : "opacity-100"
                  }`}
                >
                  {/* Node + stage label */}
                  <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-4">
                    <span
                      ref={(el) => {
                        nodes.current[i] = el;
                      }}
                      aria-hidden="true"
                      className={`relative z-10 -ml-[calc(1.5rem+6px)] block h-3 w-3 shrink-0 transition-[background-color,box-shadow,border-color] duration-200 motion-reduce:transition-none lg:ml-0 ${
                        isActive
                          ? "border border-magenta bg-magenta shadow-[0_0_0_4px_rgba(255,46,147,0.25),0_0_18px_rgba(255,46,147,0.7)]"
                          : reached
                            ? "border border-[var(--blue-ink)] bg-blue"
                            : "border border-white/30 bg-paper"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors duration-200 lg:mt-1 ${
                        isActive ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {m.stage}
                    </span>
                  </div>

                  {/* The model's content — what the glass plate frames. Its
                      padding is pulled back out with negative margins so the
                      text stays aligned with the node and stage label. */}
                  <div
                    ref={(el) => {
                      bodies.current[i] = el;
                    }}
                    className="-mx-5 mt-2 p-5 lg:row-span-5 lg:-mx-6 lg:mt-3 lg:grid lg:grid-rows-subgrid lg:p-6"
                  >
                    <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xl font-bold tracking-tight text-ink">
                      {m.title}
                      {m.featured && (
                        <span className="rounded-full bg-magenta px-2.5 py-1 text-[0.6875rem] font-extrabold uppercase tracking-[0.12em] text-white">
                          {m.tag}
                        </span>
                      )}
                    </h3>
                    <p
                      className={`mt-3 font-avenir text-[2rem] font-extrabold leading-none tracking-tight transition-colors duration-200 ${
                        isActive ? "text-magenta" : "text-ink/85"
                      }`}
                    >
                      {m.anchor}
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink-soft">{m.anchorNote}</p>
                    <p className="mt-4 text-base leading-relaxed text-ink-soft">{m.desc}</p>
                    <ul className="mt-4 flex flex-col gap-2 self-start border-t border-line pt-4">
                      {m.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-base leading-snug text-ink">
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div data-reveal="block" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-6">
          <CtaLink cta="book" />
          <p className="text-base text-ink-soft">Not sure which fits? We&rsquo;ll recommend one on the call.</p>
        </div>
      </div>
    </PixelSection>
  );
}
