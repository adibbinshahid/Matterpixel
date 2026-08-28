"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Expand, Pause, Play, X } from "lucide-react";
import type { MediaAsset } from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { EASE, cn } from "@/lib/utils";

/**
 * The AI lanes' counterpart to BrowserFrame — and the "ProjectMedia" that
 * frame's own comment already points at.
 *
 * BrowserFrame's chrome is an argument: an address bar says the screenshot
 * is of a URL you can open. A still or a film has no URL to show, so the
 * equivalent argument here is a gallery matte — dark, hard-edged, the same
 * hardcoded #0f0f13 well BrowserFrame uses. A generated frame floating on
 * the page background reads as decoration; the same frame in a matte reads
 * as a piece that was made. Hardcoded rather than themed for exactly the
 * reason BrowserFrame gives: this treatment has to hold against whatever
 * colours are inside it, in either theme.
 */

/* ────────────────────────────────────────────────────────────────────────
   Spec strip — the card's proof block
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Geometric twin of LighthouseScores' `sm` score boxes: a 2x2 of bordered
 * boxes at the same width, so a websites row and an AI row put their proof
 * block in the same place and the grid does not re-shuffle on a filter
 * switch.
 *
 * It borrows `.project-card-score` too, which is what makes the hover's
 * last beat identical across both card types — but publishes `--band` as
 * the card's own accent rather than a Lighthouse pass/fail colour. A
 * turnaround has no 0-100 band to fail, and inventing one would be the
 * exact dishonesty the metrics row exists to avoid.
 */
export function SpecStrip({
  specs,
  className,
}: {
  specs: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-1.5", className)}>
      {specs.map((s) => (
        <div
          key={s.label}
          style={{ "--band": "var(--accent)" } as React.CSSProperties}
          className="project-card-score flex flex-col items-center justify-center rounded-[var(--mp-radius-sm)] border border-line bg-paper px-2 py-3 text-center"
        >
          <dt className="whitespace-nowrap text-[10px] font-medium leading-none tracking-tight text-ink-soft">
            {s.label}
          </dt>
          <dd className="m-0 mt-1 whitespace-nowrap text-lg font-extrabold leading-none tracking-tight text-[var(--band)]">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Tile
   ──────────────────────────────────────────────────────────────────────── */

/**
 * One asset in its matte.
 *
 * A clip holds its poster at rest and starts on hover — never on mount.
 * Four autoplaying films in a grid is four decoders running, a scroll that
 * drops frames on a laptop, and a set of clips all at different points in
 * their own loops, which reads as noise rather than as work. The poster is
 * a real frame of the piece, so the resting grid is already the set; the
 * hover only makes one of them move.
 *
 * The hover beat is deliberately not the website card's rake. A film
 * announces itself the way a film does: the poster dips, playback fades up
 * underneath it, and a hairline in the piece's accent draws across the
 * bottom edge for the clip's own length — a transport, not a shine. The
 * badge carries the runtime so nobody has to hover to learn it.
 *
 * `preload="none"` matters: without it a lane of clips fetches every file
 * on mount, which on a phone is the whole set downloaded to show four
 * static frames.
 */
export function MediaTile({
  asset,
  sizes = "(min-width: 1024px) 45vw, 100vw",
  priority,
  className,
  onExpand,
  eager,
}: {
  asset: MediaAsset;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Provided by MediaGallery; omitted for a bare tile (a grid card). */
  onExpand?: () => void;
  /** Skip the hover gate and play as soon as the tile is on screen — the
   * case study's lead asset only, where the film IS the hero. */
  eager?: boolean;
}) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const isVideo = asset.kind === "video";

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    /* play() rejects on a tab that is backgrounded or a decoder that is
       busy; an unhandled rejection here would surface as a console error on
       every fast pointer sweep across the grid. */
    void v.play().then(() => setPlaying(true)).catch(() => {});
  }, [reduced]);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    /* Rewind rather than freeze: a paused mid-clip frame is a worse resting
       state than the poster it replaced, and the next hover should start
       the piece rather than resume it. */
    v.currentTime = 0;
    setPlaying(false);
  }, []);

  /* The eager lead plays from an IntersectionObserver instead of a pointer,
     so it also runs on touch — where there is no hover to gate on. */
  useEffect(() => {
    if (!eager || reduced || !isVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? play() : stop()),
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [eager, reduced, isVideo, play, stop]);

  /* The frame carries a `layoutId` in gallery mode so the overlay can grow
     out of the exact tile that was clicked — see MediaGallery. A bare tile
     (a grid card) has no overlay to travel to and so takes none: an unpaired
     layoutId would leave motion projecting against nothing. */
  const shared = onExpand ? { layoutId: `media-frame-${asset.src}` } : {};
  const rootProps = {
    ...shared,
    onMouseEnter: eager ? undefined : play,
    onMouseLeave: eager ? undefined : stop,
    onFocus: eager ? undefined : play,
    onBlur: eager ? undefined : stop,
    className: cn(
      "media-tile group/tile relative block w-full overflow-hidden rounded-[var(--mp-radius-md)] border border-[rgba(255,255,255,0.09)] bg-[#0f0f13] text-left shadow-[0_24px_60px_-24px_rgba(22,22,28,0.55)]",
      onExpand && "cursor-zoom-in",
      className,
    ),
    style: { aspectRatio: asset.aspect },
  };

  const body = (
    <>
      {isVideo ? (
        <>
          {asset.poster && (
            <Image
              src={asset.poster}
              alt={asset.caption}
              fill
              sizes={sizes}
              priority={priority}
              className={cn(
                "media-tile-poster object-cover transition-opacity duration-500 ease-[var(--ease-site)]",
                playing && "opacity-0",
              )}
            />
          )}
          <video
            ref={videoRef}
            src={asset.src}
            poster={asset.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={asset.caption}
            className="media-tile-shot h-full w-full object-cover"
          />
        </>
      ) : (
        <Image
          src={asset.src}
          alt={asset.caption}
          fill
          sizes={sizes}
          priority={priority}
          className="media-tile-shot object-cover"
        />
      )}

      {/* Same resting veil as the website card, same reason: a mixed set of
          generated frames has no common palette, and a hair of ink is what
          lets six of them read as one body of work until one is hovered. */}
      <div
        aria-hidden="true"
        className="media-tile-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(15,15,19,0.42)] via-[rgba(15,15,19,0.08)] to-transparent"
      />

      {/* Transport hairline — draws for the clip's own runtime, so the bar
          is telling the truth about how much film is left rather than
          animating a decorative constant. */}
      {isVideo && (
        <span
          aria-hidden="true"
          className="media-tile-transport pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--accent,var(--blue))]"
          style={{ animationDuration: durationSeconds(asset.duration) }}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        {isVideo && asset.duration && (
          <span className="media-tile-badge inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,15,19,0.72)] px-2.5 py-1 font-mono text-[11px] tracking-tight text-[#f5f3ee] backdrop-blur-sm">
            {playing ? (
              <Pause className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Play className="h-3 w-3" aria-hidden="true" />
            )}
            {asset.duration}
          </span>
        )}
        {onExpand && (
          <span className="media-tile-expand ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(15,15,19,0.72)] text-[#f5f3ee] backdrop-blur-sm">
            <Expand className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  );

  return onExpand ? (
    <motion.button type="button" onClick={onExpand} aria-label={`Expand: ${asset.caption}`} {...rootProps}>
      {body}
    </motion.button>
  ) : (
    <motion.div {...rootProps}>{body}</motion.div>
  );
}

/** "0:30" -> "30s", for the transport bar's animation-duration. Falls back
 * to a 12s sweep when a clip carries no runtime — a bar that never finishes
 * is worse than a bar that guesses. */
function durationSeconds(duration?: string) {
  if (!duration) return "12s";
  const [m, s] = duration.split(":").map(Number);
  const total = Number.isFinite(m) && Number.isFinite(s) ? m * 60 + s : 12;
  return `${total || 12}s`;
}

/* ────────────────────────────────────────────────────────────────────────
   Gallery + lightbox
   ──────────────────────────────────────────────────────────────────────── */

/**
 * The set, and the full-bleed view of one piece.
 *
 * The expand is a shared-element move (`layoutId` on the frame), not a
 * modal that fades in over the grid: the tile the visitor clicked travels
 * to the centre and grows, so the thing they are now looking at is visibly
 * the thing they chose. A cross-fade would make it a different object in a
 * different place, and with mixed aspect ratios in the grid that reads as a
 * jump cut.
 *
 * In the overlay the film gets real `controls` and drops its mute — this is
 * the one place a visitor has asked for the piece, so it should behave like
 * a player rather than like a hover effect.
 */
export function MediaGallery({
  items,
  className,
}: {
  items: MediaAsset[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : items[open];

  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  /* Keys and scroll lock live together: both are the overlay's, both have to
     come back the moment it closes, and splitting them across two effects is
     how a page ends up permanently unscrollable after a fast Esc. */
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, step]);

  return (
    <>
      {/* Columns, not rows: the set is mixed-ratio by design (a 9:16 cutdown
          beside a 16:9 master), and a row grid would either crop them all to
          one shape or leave a ragged band of dead space under every short
          tile. A masonry column keeps every piece at its delivered ratio. */}
      <div className={cn("columns-1 gap-5 sm:columns-2 [&>*]:mb-5", className)}>
        {items.map((asset, i) => (
          <figure key={asset.src} className="break-inside-avoid">
            <MediaTile
              asset={asset}
              onExpand={() => setOpen(i)}
              sizes="(min-width: 640px) 45vw, 100vw"
              priority={i === 0}
            />
            <figcaption className="mt-3 text-sm leading-relaxed text-ink-soft">
              {asset.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={active.caption}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.3, ease: EASE }}
            onClick={() => setOpen(null)}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[rgba(15,15,19,0.92)] backdrop-blur-md"
            />

            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] text-[#f5f3ee] transition-colors duration-300 hover:border-[#f5f3ee] sm:right-8 sm:top-8"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.figure
              /* Stops a click on the piece itself from closing the overlay —
                 the backdrop owns that gesture. */
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex max-h-full w-full max-w-5xl flex-col items-center gap-5"
              transition={{ duration: reduced ? 0.12 : 0.42, ease: EASE }}
            >
              <motion.div
                layoutId={reduced ? undefined : `media-frame-${active.src}`}
                className="relative w-full overflow-hidden rounded-[var(--mp-radius-md)] bg-[#0f0f13]"
                style={{ aspectRatio: active.aspect, maxHeight: "72vh" }}
              >
                {active.kind === "video" ? (
                  <video
                    key={active.src}
                    src={active.src}
                    poster={active.poster}
                    controls
                    autoPlay={!reduced}
                    loop
                    playsInline
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    key={active.src}
                    src={active.src}
                    alt={active.caption}
                    fill
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    className="object-contain"
                  />
                )}
              </motion.div>

              <motion.figcaption
                className="flex w-full items-start justify-between gap-6 text-sm leading-relaxed text-[#f5f3ee]/80"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.12 : 0.35, ease: EASE, delay: reduced ? 0 : 0.12 }}
              >
                <span className="max-w-2xl">{active.caption}</span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-[#f5f3ee]/50">
                  {(open ?? 0) + 1} / {items.length}
                </span>
              </motion.figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
