"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Fits every line to a single uniform font-size sized so the WIDEST line
 * spans exactly the full width of its container — real canvas text
 * measurement (same technique as FeatureStrip.tsx), not a guessed clamp(),
 * so a heading genuinely reaches edge-to-edge at any viewport width
 * instead of an approximation that's only right sometimes.
 *
 * Shared by every section that wants the Services fold's giant-headline
 * treatment (originally built there, extracted so "how we build" /
 * "selected builds" can render at the exact same scale rather than a
 * hand-matched font-size that drifts out of sync at other viewports).
 *
 * `sizeRef` (optional): fit the font-size to a *different* set of lines
 * than the ones actually rendered, so a shorter headline can be forced to
 * the exact same pixel size as a longer reference headline (Services')
 * instead of independently filling its own, shorter, container width —
 * still responsive at every viewport since it's the same real
 * canvas-measurement, just measuring different text.
 *
 * Measuring against *this instance's own* container wouldn't be enough
 * for true pixel parity in `sizeRef` mode: Services' heading sits in a
 * `px-4 sm:px-6` container while other sections use `.section-shell`'s
 * wider `sm:px-8 lg:px-12` — same max-width, different padding, so the
 * two would still land on visibly different sizes despite measuring the
 * same reference text. `sizeRef` mode therefore recomputes Services' own
 * container width directly from the viewport instead of trusting
 * `el.clientWidth`, so it matches regardless of the calling section's own
 * padding.
 */
const SERVICES_MAX_WIDTH = 1400;
const SERVICES_GUTTER = { base: 16, sm: 24 }; // px-4 / sm:px-6, from ServicesHeading

function servicesContainerWidth() {
  const gutter = window.innerWidth >= 640 ? SERVICES_GUTTER.sm : SERVICES_GUTTER.base;
  // Padding applies to the *outer* container, and only then does the
  // max-w-1400 inner div clamp — not the other way around, so the gutter
  // has to come out before the cap, not after.
  return Math.min(window.innerWidth - gutter * 2, SERVICES_MAX_WIDTH);
}

export function GiantHeading({
  lines,
  sizeRef,
  highlight,
  highlightGradient,
  maxFontSize,
}: {
  lines: string[];
  sizeRef?: string[];
  /** Exact substring to brand-color magenta wherever it appears — each
   * heading names its own (e.g. "pixel-perfect", "custom codes"), not a
   * single word hardcoded for every caller. */
  highlight?: string;
  /** Renders `highlight` as a blue-to-magenta gradient fill instead of
   * solid magenta — opt-in so existing solid-magenta callers are unaffected. */
  highlightGradient?: boolean;
  /** Caps the fitted size (px) — for callers that want "shrink to fit on
   * narrow viewports" without also growing to a full edge-to-edge giant
   * headline on wide ones (e.g. a page hero's h1, not a section giant
   * heading). Omit for the original always-edge-to-edge behavior. */
  maxFontSize?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);
  const measureLines = sizeRef ?? lines;

  useLayoutEffect(() => {
    const el = containerRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!el || !ctx) return;

    function update() {
      if (!el || !ctx) return;
      const cw = sizeRef ? servicesContainerWidth() : el.clientWidth;
      const bodyFont = getComputedStyle(document.body).fontFamily;
      const REF = 100;
      ctx.font = `800 ${REF}px ${bodyFont}`;
      const widest = Math.max(...measureLines.map((line) => ctx.measureText(line).width));
      let next = widest > 0 ? (cw / widest) * REF : REF;
      if (maxFontSize) next = Math.min(next, maxFontSize);
      setFontSize((prev) => (prev !== null && Math.abs(prev - next) < 0.5 ? prev : next));
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureLines, sizeRef, maxFontSize]);

  return (
    <div ref={containerRef} className="w-full">
      {lines.map((line) => (
        <div
          key={line}
          className="whitespace-nowrap font-extrabold leading-[0.94] tracking-tight text-ink"
          style={{ fontSize: fontSize ? `${fontSize}px` : "1px", opacity: fontSize ? 1 : 0 }}
        >
          {highlight ? highlightSubstring(line, highlight, highlightGradient) : line}
        </div>
      ))}
    </div>
  );
}

/** Brand-colors every occurrence of `needle` in `line`, exact substring
 * match (the callers pass copy they wrote themselves, case already
 * matching what's rendered). */
function highlightSubstring(line: string, needle: string, gradient?: boolean) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return line.split(new RegExp(`(${escaped})`)).map((part, i) =>
    part === needle ? (
      <span
        key={i}
        className={gradient ? "bg-clip-text text-transparent" : "text-magenta"}
        style={gradient ? { backgroundImage: "linear-gradient(90deg, var(--blue), var(--magenta))" } : undefined}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
