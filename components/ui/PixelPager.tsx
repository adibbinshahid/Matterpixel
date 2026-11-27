"use client";

/**
 * Position marker for a phone swipe row: one square pixel per card, the
 * current one stretched into a magenta bar (the brand's pixel, elongated),
 * with a "02 / 06" count beside it. Each pixel is a 44px-tall button that
 * jumps the row to its card, so the marker doubles as navigation.
 */
export function PixelPager({
  count,
  index,
  onSelect,
  controls,
  itemLabel,
  tone = "dark",
  className = "",
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
  /** id of the scrolling row. */
  controls: string;
  /** Names one card for screen readers: "Show industry 3". */
  itemLabel: string;
  /** Ground the pager sits on. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const idle = tone === "dark" ? "bg-white/25" : "bg-ink/20";
  const text = tone === "dark" ? "text-white/60" : "text-ink-soft";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className={`font-avenir text-xs tabular-nums tracking-[0.08em] ${text}`} aria-hidden="true">
        <span className={tone === "dark" ? "text-white" : "text-ink"}>{String(index + 1).padStart(2, "0")}</span>
        {" / "}
        {String(count).padStart(2, "0")}
      </span>
      <div className="flex items-center">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-controls={controls}
            aria-label={`Show ${itemLabel} ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => onSelect(i)}
            className="flex h-11 min-w-5 items-center justify-center px-1"
          >
            <span
              aria-hidden="true"
              className={`block h-1.5 transition-[width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                i === index ? "w-6 bg-magenta" : `w-1.5 ${idle}`
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
