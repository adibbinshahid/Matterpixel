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

export function GiantHeading({ lines, sizeRef }: { lines: string[]; sizeRef?: string[] }) {
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
      const next = widest > 0 ? (cw / widest) * REF : REF;
      setFontSize((prev) => (prev !== null && Math.abs(prev - next) < 0.5 ? prev : next));
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureLines, sizeRef]);

  return (
    <div ref={containerRef} className="w-full">
      {lines.map((line) => (
        <div
          key={line}
          className="whitespace-nowrap font-extrabold leading-[0.94] tracking-tight text-ink"
          style={{ fontSize: fontSize ? `${fontSize}px` : "1px", opacity: fontSize ? 1 : 0 }}
        >
          {highlightPixel(line)}
        </div>
      ))}
    </div>
  );
}

/** Brand-colors any occurrence of the word "pixel" — the one word this
 * heading should always call out, regardless of which line it lands on. */
function highlightPixel(line: string) {
  return line.split(/(pixel)/).map((part, i) =>
    part === "pixel" ? (
      <span key={i} className="text-magenta">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
