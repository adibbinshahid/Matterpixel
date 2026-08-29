"use client";

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { services } from "@/content/services";
import { servicesIntro, servicesCta } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { loadGsap, refreshScrollTrigger } from "@/lib/loadGsap";

/** Matches Nav's own mobile/desktop cutoff (its hamburger is `lg:hidden`)
 * — below that width the pinned vertical carousel is skipped entirely in
 * favor of a plain stacked list (see MobileServicesList). Defaults to
 * `false` so SSR/first paint never renders the heavy pinned layout (worst
 * case on a slow mobile connection); corrects up to `true` on mount
 * wherever the viewport actually is desktop-width. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

/**
 * Per-service imagery for the pinned left column, indexed 1:1 against the
 * pinned card stack — one frame per service in `services` order, plus a
 * final frame for the closing CTA card. Keyed by slug (not array order)
 * so reordering `content/services.ts` can't silently desync a card from
 * its image; `LEFT_IMAGES` below flattens it back into stack order.
 */
const SERVICE_IMAGES: Record<string, string> = {
  "web-app-development": "/services/web-app-development.webp",
  "ai-automation": "/services/ai-automation.webp",
  "branding-identity": "/services/branding-identity.webp",
  "ai-product-photography": "/services/ai-product-photography.webp",
  "ai-video": "/services/ai-video.webp",
  "seo-growth": "/services/seo-growth.webp",
};

/** Shown while the closing CTA card is active — the stack's 7th slot. */
const CTA_IMAGE = "/services/built-by-intent.webp";

/** Strength of the magenta wash laid over the left-column imagery — a
 * unifying brand tint across seven separately-generated frames, low
 * enough to read as color grade rather than a colored panel. */
const IMAGE_TINT_OPACITY = 0.12;

/** Stack-order image list: index N is the image for pinned card N, so
 * `activeIndex` addresses it directly with no modulo cycling. */
const LEFT_IMAGES = [...services.map((s) => SERVICE_IMAGES[s.slug]), CTA_IMAGE];


/** Fixed px sizing for the pinned card stack — px-based rather than a
 * viewport fraction so the gap between cards is a real, deliberate space
 * (baked into `step`) rather than an accident of window-height math. No
 * overflow-hidden clip on the track — cards scroll fully open, nothing
 * gets cropped; `CARD_HEIGHT` just sizes the layout placeholder each card
 * slot occupies. */
const CARD_HEIGHT = 300;
const CARD_GAP = 32;
const CARD_STEP = CARD_HEIGHT + CARD_GAP;
/** Closing CTA card keeps its own (taller) height — only the 6 service
 * cards were trimmed to CARD_HEIGHT's minimum-no-clip value. Card
 * *positions* still step by CARD_STEP (service-card size), so this just
 * lets the CTA render taller than the slot it starts at without affecting
 * the scroll/pin math. */
const CTA_CARD_HEIGHT = 380;

/** The pinned stack is the six service cards plus one closing CTA card
 * (replaces the old standalone magenta banner below the carousel — same
 * content, folded into the scroll sequence instead of living after it). */
const PINNED_COUNT = services.length + 1;

/** Background grid moves at this fraction of the card track's scroll
 * distance — slower than the cards (which track scroll input at a
 * natural, unstretched 1:1 rate — see SCROLL_LENGTH_MULTIPLIER) for a
 * parallax depth effect during the pin. */
const BG_PARALLAX_RATE = 0.7;

/** Multiplier on the scroll distance mapped to the cards' full travel —
 * 1 keeps cards tracking scroll input at its natural 1:1 rate. */
const SCROLL_LENGTH_MULTIPLIER = 1;

/** Extra scroll distance the pin holds AFTER the cards finish travelling,
 * so the last card visibly settles flush with the image's bottom edge
 * before the section releases — `scrub` eases the track toward its target
 * over ~1s, so without this dwell the pin let go while the final card was
 * still easing in, and it finished arriving as the section scrolled away. */
const PIN_HOLD_AFTER_LAST = 120;

/** Replicates WhoWeWorkFor's own section gutter (px-6 sm:px-8 lg:px-12,
 * max-w-1400) so this heading's `sizeRef` fit lands on the exact same
 * pixel font-size as WhoWeWorkFor's — GiantHeading's own hardcoded
 * `servicesContainerWidth` models a different section's gutter, so it
 * can't be reused here. */
function whoWeWorkForContainerWidth() {
  const w = window.innerWidth;
  const gutter = w >= 1024 ? 48 : w >= 640 ? 32 : 24;
  return Math.min(w - gutter * 2, 1400);
}

/** Computes the exact px font-size WhoWeWorkFor's own GiantHeading fits
 * to (same canvas-measurement technique, same reference line/width), so
 * this heading can match it in size while still wrapping normally inside
 * a narrow sidebar column — GiantHeading itself forces `whitespace-nowrap`
 * edge-to-edge, which would overflow a 420px column at that font-size. */
function useMatchedFontSize(referenceLine: string, containerWidth: () => number) {
  const [fontSize, setFontSize] = useState<number | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function update() {
      if (!ctx) return;
      const cw = containerWidth();
      const bodyFont = getComputedStyle(document.body).fontFamily;
      const REF = 100;
      ctx.font = `800 ${REF}px ${bodyFont}`;
      const width = ctx.measureText(referenceLine).width;
      setFontSize(width > 0 ? (cw / width) * REF : REF);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [referenceLine, containerWidth]);

  return fontSize;
}

/**
 * Section background — sits behind everything (headline, cards, CTA
 * banner) via plain DOM order. The CTA banner further down has its own
 * opaque bg-blue, so it naturally paints over this.
 *
 * A slow-drifting hairline grid (`.services-grid-bg`, see globals.css)
 * over the dark `panel-dark` base, faded out toward the edges via a
 * radial mask so it reads as an ambient field rather than a hard-edged
 * tiled pattern running to the section boundary. Forwards a ref so
 * `PinnedServicesRow` can drive it at `BG_PARALLAX_RATE` of the card
 * scroll speed for a parallax effect during the pin.
 *
 * `extraHeight` (desktop pin only): the element only spans its own
 * container's height by default (`inset-0`), but the pinned version
 * gets translated upward by more than that height over the scroll —
 * without extra height budgeted in, it would slide fully out of view
 * partway through, leaving nothing behind the cards for the rest of the
 * scroll. Padding the height by the max travel distance keeps it fully
 * covering the box for the whole pin.
 */
const ServicesBgGrid = forwardRef<HTMLDivElement, { extraHeight?: number }>(function ServicesBgGrid(
  { extraHeight },
  ref,
) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="services-grid-bg pointer-events-none absolute inset-0"
      style={{
        height: extraHeight ? `calc(100% + ${extraHeight}px)` : undefined,
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 90%)",
      }}
    />
  );
});

/** Renders the services heading with "pixel-perfect" picked out in brand
 * magenta — same source string (`servicesIntro.headingLines`) feeds both
 * the mobile and pinned-desktop heading, so this is shared rather than
 * duplicated per render site. */
function renderServicesHeading(text: string) {
  return text.split(/(pixel-perfect)/i).map((part, i) =>
    /^pixel-perfect$/i.test(part) ? (
      <span key={i} className="text-magenta">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Mobile/tablet substitute for the pinned vertical carousel (see
 * `useIsDesktop`) — a plain stacked list, each card a real link to its
 * detail page. Reveal-animated on scroll-into-view like everything else
 * on the page, not scroll-jacked.
 */
function MobileServicesList() {
  return (
    <div className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6">
      <ServicesBgGrid />
      <Reveal className="mx-auto max-w-md text-center">
        <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
        <h2 className="text-h2 text-ink">{renderServicesHeading(servicesIntro.headingLines.join(" "))}</h2>
        <p className="mt-4 text-ink-soft">{servicesIntro.engagementNote}</p>
      </Reveal>

      <RevealGroup className="mx-auto mt-10 flex max-w-md flex-col gap-5">
        {services.map((service) => (
          <RevealItem key={service.slug}>
            <Link
              href={`/services/${service.slug}`}
              className="hover-lift group relative block overflow-hidden rounded-[2rem] bg-blue p-7 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4),0_40px_80px_-28px_rgba(0,0,0,0.55)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-6 select-none text-[5.5rem] font-black leading-none text-white/10"
              >
                {service.id}
              </span>
              <div className="relative flex flex-col">
                <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden="true" />[ {service.id} ]
                </span>
                <h3 className="mt-3 text-2xl font-black leading-[1.1] tracking-tight text-white">{service.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-white/80">{service.shortDesc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </RevealItem>
        ))}

        <RevealItem>
          <Link
            href="/contact?tab=booking"
            className="hover-lift group relative block overflow-hidden rounded-[2rem] bg-magenta p-7 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4),0_40px_80px_-28px_rgba(0,0,0,0.55)]"
          >
            <div className="relative flex flex-col">
              <h3 className="text-2xl font-black leading-[1.1] tracking-tight text-white">{servicesCta.heading}</h3>
              <p className="mt-2 text-base leading-relaxed text-white/80">{servicesCta.body}</p>
              <span className="btn-brand btn-on-brand on-magenta mt-5 w-fit">
                {servicesCta.button}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </RevealItem>
      </RevealGroup>
    </div>
  );
}

/** Vertical card used in the desktop pinned-scroll stack — same blue
 * accent-card look the carousel has always used, just full-height and
 * stacked instead of side-by-side. */
function PinnedCard({ service }: { service: (typeof services)[number] }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="hover-lift group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-blue p-7 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4),0_40px_80px_-28px_rgba(0,0,0,0.55)] transition-colors duration-300 sm:p-9"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-7 select-none text-[6.5rem] font-black leading-none text-white/10 transition-colors duration-300"
      >
        {service.id}
      </span>
      <div className="relative">
        <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/70 transition-colors duration-300">
          <span className="h-1.5 w-1.5 rounded-full bg-magenta" aria-hidden="true" />[ {service.id} ]
        </span>
        <h3 className="mt-3 text-2xl font-black leading-[1.08] tracking-tight text-white transition-colors duration-300 sm:text-3xl">
          {service.title}
        </h3>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/80 transition-colors duration-300 sm:text-base">
          {service.shortDesc}
        </p>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-white/20 pt-4 transition-colors duration-300">
        <span className="text-xs text-white/70 transition-colors duration-300 sm:text-sm">
          {service.id} / {String(PINNED_COUNT).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white transition-colors duration-300 sm:text-sm">
          Learn more
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Closing CTA folded into the pinned card stack as its final card
 * (replaces the old standalone magenta banner) — same copy/badges/button
 * from `servicesCta`, magenta instead of the service cards' blue. The
 * card itself is a plain div, not a link — only the button inside is
 * clickable, so hovering/reading the card body doesn't imply navigation. */
function PinnedCtaCard() {
  const [headingLine1, headingLine2] = servicesCta.heading.split(". ");
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-magenta p-7 text-center shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4),0_40px_80px_-28px_rgba(0,0,0,0.55)] sm:p-9">
      <h3 className="text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
        {headingLine1}.
        <br />
        {headingLine2}
      </h3>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">{servicesCta.body}</p>

      <Link
        href="/contact?tab=booking"
        className="btn-brand btn-on-brand on-magenta group mt-8"
      >
        {servicesCta.button}
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </div>
  );
}

/** Vertical progress rail showing how many cards are left to scroll
 * through — one tick per service, active tick lit brand-magenta, plus a
 * numeric counter. Lives in its own column *beside* the clipped card
 * window (not inside it), so it's never overlapped or clipped by the
 * cards it's tracking. */
function ScrollProgress({ activeIndex, total }: { activeIndex: number; total: number }) {
  return (
    <div className="hidden w-14 shrink-0 flex-col items-center justify-center gap-5 lg:flex">
      <span className="text-lg font-bold tabular-nums text-ink">{String(activeIndex + 1).padStart(2, "0")}</span>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-8 w-1.5 rounded-full transition-colors duration-300 ${
              i === activeIndex ? "bg-magenta" : "bg-line"
            }`}
          />
        ))}
      </div>
      <span className="text-lg font-bold tabular-nums text-ink-soft">{String(total).padStart(2, "0")}</span>
    </div>
  );
}

/**
 * Desktop carousel: the whole two-column row pins in the viewport (GSAP
 * ScrollTrigger) while the six cards scroll continuously through a fixed
 * height window on the right. Left column (heading, subtext, image) stays
 * put; its image crossfades to match whichever card is currently active.
 * Unpins once the last card clears. Skipped under prefers-reduced-motion —
 * caller falls back to a static, non-pinned render of the same markup.
 */
function PinnedServicesRow({ reduced }: { reduced: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const cardWindowRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bottomAlignMargin, setBottomAlignMargin] = useState(0);
  const headingFontSize = useMatchedFontSize(
    "wherever you build, we understand it.",
    whoWeWorkForContainerWidth,
  );

  // Bottom-align the card window (not the whole right column — that also
  // contains ScrollProgress, which can be taller than a single card and
  // would throw the measurement off by that difference) with the left
  // image, measured directly rather than guessed via CSS align-self
  // keywords — both sides' real heights depend on dynamic content (a
  // canvas-measured giant heading font-size, an aspect-ratio image, a
  // variable-length tick rail), and `self-end`/`self-center` alignment
  // quietly stopped landing pixel-exact once both became independently
  // variable. The margin itself is applied to the outer right-column div
  // (rightColRef) so the window and the indicator rail move down together.
  // Re-measures on resize and whenever the matched heading font-size
  // settles in (that resize of the left column happens after mount, not
  // synchronously with it).
  useLayoutEffect(() => {
    const img = imageWrapRef.current;
    const col = rightColRef.current;
    const cardWindow = cardWindowRef.current;
    if (!img || !col || !cardWindow) return;

    function measure() {
      if (!img || !col || !cardWindow || window.innerWidth < 1024) {
        setBottomAlignMargin(0);
        return;
      }
      const imgBottom = img.getBoundingClientRect().bottom;
      // Never mutate col's own style directly to "reset" it before
      // measuring — if two ResizeObserver firings land on the same final
      // value, React sees no state change and skips re-applying the
      // style, silently stranding a manual reset in the live DOM. Instead
      // back the *currently applied* margin out of the measured rect
      // (via the functional updater, so it's never a stale closure value)
      // to get the natural, unmargined bottom.
      setBottomAlignMargin((prevMargin) => {
        const naturalWindowBottom = cardWindow.getBoundingClientRect().bottom - prevMargin;
        return Math.max(0, imgBottom - naturalWindowBottom);
      });
    }

    measure();
    // Only the image is worth watching — its aspect-ratio height genuinely
    // depends on viewport width. cardWindow's height is the hardcoded
    // CARD_HEIGHT constant and never legitimately changes; observing it
    // too meant GSAP's pin engaging (`position: fixed`, a sub-pixel
    // reflow) fired this callback again post-pin, and re-derived the
    // "natural" bottom from geometry that had shifted for reasons other
    // than the margin — corrupting the alignment right as the pin kicked in.
    const ro = new ResizeObserver(measure);
    ro.observe(img);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [headingFontSize]);

  // GSAP's ScrollTrigger caches the pin's start/end scroll positions when
  // it's set up (see the effect below) — but the heading's real
  // canvas-measured font-size resolves asynchronously, *after* that setup
  // runs, and bottomAlignMargin above only settles once that resolves.
  // That late layout shift invalidated ScrollTrigger's already-cached
  // geometry, so the pin ended based on stale measurements — landing
  // short of true alignment even though the margin itself was correct by
  // the time you could see it. Refresh once the margin (and therefore the
  // DOM) has actually settled, using a plain effect (runs after paint,
  // so the browser has committed the new style) rather than the
  // useLayoutEffect above.
  useEffect(() => {
    if (reduced) return;
    refreshScrollTrigger();
  }, [reduced, bottomAlignMargin]);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      const distance = (PINNED_COUNT - 1) * CARD_STEP * SCROLL_LENGTH_MULTIPLIER;


      // The pin runs LONGER than the card travel (by PIN_HOLD_AFTER_LAST) and
      // is its own ScrollTrigger, rather than being attached to the track
      // tween. `scrub: 1` smooths the track toward its target over ~1s, so
      // when pin and tween shared one trigger the pin released the moment
      // scroll hit `distance` — while the last card was still easing into
      // place. The card then finished arriving as the whole section was
      // already scrolling away (the "in parallel" motion). This dwell keeps
      // the section pinned until the last card has actually settled flush
      // with the image's bottom edge; only then does the section scroll up.
      const pinTrigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${distance + PIN_HOLD_AFTER_LAST}`,
        pin: true,
      });

      const tween = gsap.to(track, {
        y: -(PINNED_COUNT - 1) * CARD_STEP,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${distance}`,
          scrub: 1,
          onUpdate: (self) => {
            setActiveIndex(Math.round(self.progress * (PINNED_COUNT - 1)));
          },
        },
      });

      // Background grid rides the same scroll range but only travels
      // BG_PARALLAX_RATE of the card distance — slower than the (regular
      // speed) cards, reading as a parallax depth cue during the pin.
      const bg = bgRef.current;
      const bgTween = bg
        ? gsap.to(bg, {
            y: -(PINNED_COUNT - 1) * CARD_STEP * BG_PARALLAX_RATE,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: `+=${distance}`,
              scrub: 1,
            },
          })
        : null;

      refreshScrollTrigger();

      cleanup = () => {
        pinTrigger.kill();
        tween.scrollTrigger?.kill();
        tween.kill();
        bgTween?.scrollTrigger?.kill();
        bgTween?.kill();
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reduced]);

  return (
    // GSAP's `pin: true` flips this element to `position: fixed`. A block
    // with only `max-w-[1400px] mx-auto` and no explicit `width` resolves
    // that via shrink-to-fit once fixed (its containing block becomes the
    // viewport), which let the `1fr` track blow out near full-viewport
    // width instead of staying capped — hence `w-full` here (a definite
    // 100vw once fixed, no shrink-to-fit guessing) with the actual
    // centered/capped grid as a plain non-pinned child inside it.
    //
    // The bg grid lives *inside* this pinned wrapper (not as an outside
    // sibling) deliberately: an outside sibling stays in normal document
    // flow and scrolls away at the page's natural 1:1 rate the instant
    // the user scrolls, while this wrapper visually freezes in place for
    // the whole pin — so an outside bg looked like it was racing past the
    // stationary cards regardless of any rate math. In here, both start
    // from the same frozen reference frame and only diverge by the
    // deliberate BG_PARALLAX_RATE offset.
    // No overflow-hidden here — cards must stay fully open/uncropped
    // (per earlier fix); the bg grid's own radial mask already fades its
    // edges to transparent, so it doesn't need a hard clip either.
    <div ref={sectionRef} className="relative w-full px-4 pb-16 pt-28 sm:px-6 lg:px-12">
      <ServicesBgGrid ref={bgRef} extraHeight={(PINNED_COUNT - 1) * CARD_STEP * BG_PARALLAX_RATE} />
      <div className="relative mx-auto grid max-w-[1400px] items-start gap-12 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-12">
        <div className="lg:self-start">
          {/* y={0}: this column's own bottom edge gets pixel-measured
             (see bottomAlignMargin below) to align the card stack against
             it — Reveal's default translateY entrance would leave that
             measurement racing a transform that hasn't settled to y:0
             yet, intermittently capturing a stale, offset position.
             Opacity/blur-only avoids the transform entirely. */}
          <Reveal y={0}>
            <p className="mb-4 font-semibold uppercase tracking-[0.12em] text-ink" style={{ fontSize: "clamp(0.875rem, 0.6rem + 1.2vw, 1.5rem)" }}>
              {servicesIntro.eyebrow}
            </p>
            <h2
              className="font-extrabold leading-[1.05] tracking-tight text-ink"
              style={{
                fontSize: headingFontSize ? `${headingFontSize}px` : undefined,
                opacity: headingFontSize ? 1 : 0,
              }}
            >
              {renderServicesHeading(servicesIntro.headingLines.join(" "))}
            </h2>
            <p className="mt-5 max-w-sm text-ink-soft">{servicesIntro.engagementNote}</p>

            <div
              ref={imageWrapRef}
              className="relative mt-8 aspect-[16/10] overflow-hidden rounded-[var(--mp-radius-md)] border border-line"
            >
              {LEFT_IMAGES.map((src, i) => {
                // Direct index — LEFT_IMAGES is built in pinned-stack order
                // and is exactly PINNED_COUNT long, so there is nothing to
                // wrap around (the old placeholder set was shorter than the
                // stack and had to cycle).
                const active = i === activeIndex;
                return (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    fill
                    // Lazy, not eager: this section sits several folds down,
                    // so eagerly pulling all four crossfade frames put them
                    // in direct bandwidth competition with the hero's own
                    // LCP paint. The browser's lazy threshold starts these
                    // well before the section scrolls into view.
                    loading="lazy"
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="object-cover"
                    style={{
                      opacity: active ? 1 : 0,
                      zIndex: active ? 1 : 0,
                      transition: "opacity 500ms ease-in-out",
                    }}
                  />
                );
              })}

              {/* Brand magenta wash over whichever frame is showing — sits
                 above the crossfading images (they top out at z-index 1) so
                 the tint stays constant while frames swap underneath, rather
                 than fading in and out with each one. Kept as an overlay
                 rather than baked into the WebP files so the source art
                 stays neutral and the tint is a one-value change here. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[2] bg-magenta"
                style={{ opacity: IMAGE_TINT_OPACITY }}
              />
            </div>
          </Reveal>
        </div>

        {/* Bottom-aligned to the left image via measured `bottomAlignMargin`
           (see the useLayoutEffect above), not a CSS align-self keyword —
           both columns' heights are independently dynamic (canvas-fitted
           heading size, aspect-ratio image, variable tick rail), so a
           guessed `self-end`/`self-center` drifted a hundred-plus px off
           in practice. This keeps the last card's bottom edge pixel-flush
           with the image's bottom edge, with nothing dead below it once
           the stack finishes scrolling through, right as the pin releases. */}
        <div ref={rightColRef} className="flex items-stretch gap-4 lg:gap-6" style={{ marginTop: bottomAlignMargin }}>
          <div
            ref={cardWindowRef}
            className="relative min-w-0 flex-1"
            style={reduced ? undefined : { height: CTA_CARD_HEIGHT }}
          >
            <div
              ref={trackRef}
              className={`flex flex-col gap-6 ${reduced ? "" : "lg:absolute lg:inset-0 lg:block lg:gap-0"}`}
            >
              {services.map((service, i) => (
                <div
                  key={service.slug}
                  className={`h-[22rem] lg:w-[70%] ${reduced ? "" : "lg:absolute lg:inset-x-0 lg:mx-auto"}`}
                  style={reduced ? undefined : { top: `${i * CARD_STEP}px`, height: CARD_HEIGHT }}
                >
                  <PinnedCard service={service} />
                </div>
              ))}
              <div
                key="cta"
                className={`h-[22rem] lg:w-[70%] ${reduced ? "" : "lg:absolute lg:inset-x-0 lg:mx-auto"}`}
                style={reduced ? undefined : { top: `${services.length * CARD_STEP}px`, height: CTA_CARD_HEIGHT }}
              >
                <PinnedCtaCard />
              </div>
            </div>
          </div>

          {!reduced && (
            <ScrollProgress activeIndex={Math.min(activeIndex, services.length - 1)} total={services.length} />
          )}
        </div>
      </div>
    </div>
  );
}

function ServicesCarousel() {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  if (!isDesktop) return <MobileServicesList />;

  return <PinnedServicesRow reduced={reduced} />;
}

export function ServicesFold() {
  return (
    <section id="services" className="panel-dark relative">
      {/* The closing CTA used to be a standalone magenta banner after the
         carousel; it's now folded in as the stack's final card (see
         PinnedCtaCard / MobileServicesList's trailing card) instead, so
         this section is just the carousel now — no second wrapper needed. */}
      <div data-nav-scrim="light" className="relative">
        <ServicesCarousel />
      </div>
    </section>
  );
}
