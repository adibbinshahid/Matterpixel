"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, Pause, Play, X } from "lucide-react";
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
          {/* Sized by content, not fixed: a box holds "15" and it holds
              "3:2 · 1:1 +2", and at one size either the short values look
              timid or the long ones spill out of a ~70px box. Wrapping is
              allowed for the same reason — the 2x2 is a grid, so a value
              that takes two lines lifts all four boxes together instead of
              breaking the row. */}
          <dd
            className={cn(
              "m-0 mt-1 font-extrabold leading-tight tracking-tight text-[var(--band)]",
              s.value.length > 7 ? "text-[13px]" : "text-lg",
            )}
          >
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
  ratio,
  compact,
}: {
  asset: MediaAsset;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Provided by MediaGallery; omitted for a bare tile (a grid card). */
  onExpand?: () => void;
  /** Overrides the asset's delivered ratio — the contact-sheet grid squares
   * every thumbnail so the set reads as one block. The uncropped piece is
   * one click away in the overlay, which is where the real ratio matters. */
  ratio?: string;
  /** Thumbnail scale: smaller radius, smaller chrome, no runtime badge
   * competing with a 200px tile. */
  compact?: boolean;
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

  /* The frame carries a `layoutId` in gallery mode so the overlay can grow
     out of the exact tile that was clicked — see MediaGallery. A bare tile
     (a grid card) has no overlay to travel to and so takes none: an unpaired
     layoutId would leave motion projecting against nothing. */
  const shared = onExpand ? { layoutId: `media-frame-${asset.src}` } : {};
  const rootProps = {
    ...shared,
    onMouseEnter: play,
    onMouseLeave: stop,
    onFocus: play,
    onBlur: stop,
    className: cn(
      "media-tile group/tile relative block w-full overflow-hidden border border-[rgba(255,255,255,0.09)] bg-[#0f0f13] text-left",
      compact
        ? "rounded-[var(--mp-radius-sm)] shadow-[0_10px_24px_-16px_rgba(22,22,28,0.55)]"
        : "rounded-[var(--mp-radius-md)] shadow-[0_24px_60px_-24px_rgba(22,22,28,0.55)]",
      onExpand && "cursor-zoom-in",
      className,
    ),
    style: { aspectRatio: ratio ?? asset.aspect },
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

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3",
          compact ? "p-2" : "p-3",
        )}
      >
        {isVideo && asset.duration && (
          <span
            className={cn(
              "media-tile-badge inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,15,19,0.72)] font-mono tracking-tight text-[#f5f3ee] backdrop-blur-sm",
              compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
            )}
          >
            {playing ? (
              <Pause className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Play className="h-3 w-3" aria-hidden="true" />
            )}
            {asset.duration}
          </span>
        )}
        {onExpand && (
          <span
            className={cn(
              "media-tile-expand ml-auto inline-flex items-center justify-center rounded-full bg-[rgba(15,15,19,0.72)] text-[#f5f3ee] backdrop-blur-sm",
              compact ? "h-6 w-6" : "h-8 w-8",
            )}
          >
            <Expand className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
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

/** The still that stands in for an asset in the filmstrip. */
function thumbSrc(asset: MediaAsset) {
  return asset.kind === "video" ? asset.poster : asset.src;
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
  const stripRef = useRef<HTMLDivElement>(null);
  /* createPortal needs document.body, which does not exist during the
     server render — so the overlay only mounts after hydration. Nothing is
     lost: it is closed on first paint anyway. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  /* Drag the filmstrip along with the selection. Without this, arrowing past
     the eighth piece of a seventeen-piece set leaves the strip's highlight
     off-screen and the visitor loses their place in the set they came to
     see all of. */
  useEffect(() => {
    if (open === null) return;
    stripRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [open, reduced]);

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
      {/* A contact sheet, not a showcase. Fifteen frames at half the page
          width is a scroll long enough that a visitor gives up at six and
          never learns the set is fifteen — so the grid's job is to fit the
          whole set in a glance and hand the real viewing to the overlay.
          Squares are the price: mixed ratios cannot tile without either a
          ragged masonry (which reintroduces the height) or dead space. The
          uncropped piece is one click away, and the copy above says so. */}
      <div
        className={cn(
          "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4",
          className,
        )}
      >
        {items.map((asset, i) => (
          <MediaTile
            key={asset.src}
            asset={asset}
            onExpand={() => setOpen(i)}
            ratio="1 / 1"
            compact
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
            priority={i < 4}
          />
        ))}
      </div>

      {/* Portalled to <body>. The gallery renders inside a Reveal, which is
          a transformed element and therefore a stacking context — so a
          `z-[100]` overlay nested in it still loses to the fixed header at
          z-50, and the close button lands underneath the nav. Escaping to
          the body is the only fix that does not turn the header's z-index
          into a number this file has to know about. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {active && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={active.caption}
                /* dvh, not vh: on a phone the URL bar makes 100vh taller
                   than the screen, which is exactly how a filmstrip ends up
                   below the fold. */
                className="fixed inset-0 z-[200] flex h-dvh flex-col items-center justify-center p-3 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0.12 : 0.3, ease: EASE }}
                onClick={() => setOpen(null)}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[rgba(15,15,19,0.94)] backdrop-blur-md"
                />

                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(15,15,19,0.6)] text-[#f5f3ee] backdrop-blur-sm transition-colors duration-300 hover:border-[#f5f3ee] sm:right-6 sm:top-6 sm:h-11 sm:w-11"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Keyboard arrows already worked, but nothing on screen said
                    so. These are the visible promise that there is more of
                    the set behind this frame — the same reason the filmstrip
                    and the counter are here. */}
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        step(-1);
                      }}
                      aria-label="Previous"
                      className="absolute left-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(15,15,19,0.6)] text-[#f5f3ee] backdrop-blur-sm transition-colors duration-300 hover:border-[#f5f3ee] sm:left-6 sm:h-11 sm:w-11"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        step(1);
                      }}
                      aria-label="Next"
                      className="absolute right-2 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(15,15,19,0.6)] text-[#f5f3ee] backdrop-blur-sm transition-colors duration-300 hover:border-[#f5f3ee] sm:right-6 sm:h-11 sm:w-11"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* One column that owns the whole viewport height and hands
                    the leftover to the frame: caption and filmstrip take
                    what they need (`shrink-0`), the frame takes the rest
                    (`flex-1 min-h-0`). The old fixed 62vh could not know how
                    tall the caption wrapped to, so on a short laptop the
                    strip fell off the bottom. */}
                <motion.figure
                  /* Stops a click on the piece itself from closing the
                     overlay — the backdrop owns that gesture. */
                  onClick={(e) => e.stopPropagation()}
                  /* Phone gets no side gutter: a 16:9 piece inside a 390px screen
                     is small enough already, and the arrows have their own
                     scrim so overlapping the frame edge costs nothing. On a
                     desktop the gutter keeps them off the piece entirely. */
                  className="relative z-10 flex h-full w-full max-w-6xl flex-col items-center gap-3 px-1 sm:gap-4 sm:px-14"
                  transition={{ duration: reduced ? 0.12 : 0.42, ease: EASE }}
                >
                  {/* No matte and no aspect-ratio box here. The frame is
                      whatever space is left and the piece is `object-contain`
                      inside it, which is the only sizing that fits a 9:16 and
                      a 16:9 on the same screen without either one being
                      cropped or overflowing. The backdrop is already the
                      matte colour, so nothing is lost visually. */}
                  <motion.div
                    layoutId={reduced ? undefined : `media-frame-${active.src}`}
                    className="relative min-h-0 w-full flex-1"
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
                    className="flex w-full shrink-0 items-start justify-between gap-6 text-sm leading-relaxed text-[#f5f3ee]/80"
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

                  {/* The set, laid out flat under the piece being viewed. The
                      grid above already showed it, but once the overlay is
                      open the grid is gone — and this is exactly the moment a
                      visitor decides whether there is anything left to look
                      at. */}
                  {items.length > 1 && (
                    <motion.div
                      ref={stripRef}
                      className="flex w-full shrink-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduced ? 0.12 : 0.35, ease: EASE, delay: reduced ? 0 : 0.18 }}
                    >
                      {items.map((item, i) => (
                        <button
                          key={item.src}
                          type="button"
                          data-active={i === open}
                          onClick={() => setOpen(i)}
                          aria-label={`View ${i + 1} of ${items.length}: ${item.caption}`}
                          aria-current={i === open}
                          className={cn(
                            "relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--mp-radius-sm)] bg-[#0f0f13] transition-opacity duration-300 sm:h-14 sm:w-14",
                            i === open
                              ? "opacity-100 ring-2 ring-[#f5f3ee]"
                              : "opacity-45 hover:opacity-80",
                          )}
                        >
                          {/* A clip's poster, never its src — next/image
                              cannot render an .mp4, and a posterless clip is
                              better as an empty well than a broken tile. */}
                          {thumbSrc(item) && (
                            <Image
                              src={thumbSrc(item) as string}
                              alt=""
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.figure>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
