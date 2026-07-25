"use client";

import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import { getLenis } from "@/components/SmoothScrollProvider";
import { services } from "@/content/services";
import { bookingUrl, servicesIntro, servicesCta } from "@/content/siteConfig";
import { DURATIONS } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

const ACTIVE_SCALE = 1.1; // scale of the centered card
const REST_SCALE = 0.8; // scale of an unselected/off-center card — 20% smaller than the neutral 1x baseline
const CARD_GAP = 56; // px — matches the gap-14 row class below

/**
 * Section background — sits behind everything (headline, cards, CTA
 * banner) via plain DOM order. The CTA banner further down has its own
 * opaque bg-blue, so it naturally paints over this.
 *
 * A slow-drifting hairline grid (`.services-grid-bg`, see globals.css)
 * over the dark `panel-dark` base, faded out toward the edges via a
 * radial mask so it reads as an ambient field rather than a hard-edged
 * tiled pattern running to the section boundary.
 */
function ServicesBgGrid() {
  return (
    <div
      aria-hidden="true"
      className="services-grid-bg pointer-events-none absolute inset-0"
      style={{
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 90%)",
      }}
    />
  );
}

/**
 * Same margin recipe as Nav's own pill (px-4 sm:px-6 outer gutter,
 * max-w-[1400px] centered) so the giant heading's edges line up with the
 * nav bar's, instead of running to the true screen edge.
 *
 * Rendered *inside* the pinned wrapper in motion mode (see
 * PinnedCarouselRow) rather than above it, so the heading stays visible
 * throughout the whole horizontal scrub instead of scrolling away the
 * moment the card row engages its pin.
 */
function ServicesHeading() {
  return (
    <div className="relative px-4 pb-4 pt-28 sm:px-6 sm:pb-5 sm:pt-28">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center text-center">
        <Reveal className="w-full">
          <p className="label-eyebrow mb-4" style={{ fontSize: "1.5rem" }}>
            {servicesIntro.eyebrow}
          </p>
          <h2>
            <GiantHeading lines={servicesIntro.headingLines} />
          </h2>
        </Reveal>
      </div>
    </div>
  );
}

/** Curved glow baseline the cards sit along — decorative only, sits
 * behind the row (earlier in DOM, no z-index needed). Shared by both
 * carousel modes below. */
function ServicesArcGlow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-10 h-28 w-full opacity-80 sm:bottom-16"
    >
      <defs>
        <linearGradient id="services-arc-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--blue)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--magenta)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--blue)" stopOpacity="0" />
        </linearGradient>
        <filter id="services-arc-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <path
        d="M0,120 Q720,-20 1440,120"
        stroke="url(#services-arc-glow)"
        strokeWidth="2.5"
        fill="none"
        filter="url(#services-arc-blur)"
      />
    </svg>
  );
}

export function ServicesFold() {
  return (
    <section id="services" className="panel-dark relative border-t border-line">
      <ServicesBgGrid />

      <ServicesCarousel />

      {/* Same structure/style as FinalCta.tsx's closing banner — flat
         single-color heading, one body paragraph, a primary pill link plus
         a plain-text secondary link, no badges row, no corner decoration.
         Explicit white/black here rather than the text-paper/bg-paper
         tokens — this banner sits inside the outer panel-dark section,
         which reassigns exactly those tokens to their dark-mode values,
         flipping this "light text + white pill on blue" banner backwards
         into black text on blue with a black button. */}
      <div className="relative overflow-hidden border-t border-line px-6 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px]">
          <Reveal duration={DURATIONS.standard} delay={0.1}>
            <h3 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {servicesCta.heading}
            </h3>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">{servicesCta.body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="hover-lift font-avenir group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm text-black hover:bg-black hover:text-white"
              >
                {servicesCta.button}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit origin-left text-sm font-semibold text-white underline-offset-4 transition-transform duration-300 hover:scale-105 hover:underline"
              >
                Book a 15-min intro call
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type CardRefs = MutableRefObject<(HTMLDivElement | null)[]>;

/**
 * Per-card scale/lift/tilt/glow math, shared by both carousel modes below.
 * Takes only a `centerX` (viewport px) and each card's real
 * `getBoundingClientRect()` — it doesn't care whether that position came
 * from native `scrollLeft` or a GSAP-driven `transform: translateX`, so
 * the same function drives both the reduced-motion fallback and the
 * pinned/scrubbed version without duplicating the visual treatment.
 */
function applyCardTransforms(cards: CardRefs, glowRings: CardRefs, centerX: number) {
  cards.current.forEach((el, i) => {
    if (!el) return;
    const cardRect = el.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const step = cardRect.width + CARD_GAP;
    const d = Math.max(-1, Math.min(1, (cardCenter - centerX) / step));
    const absD = Math.abs(d);

    const scale = REST_SCALE + (ACTIVE_SCALE - REST_SCALE) * (1 - absD);
    // Off-center cards sit noticeably lower than the centered one,
    // reading as a pronounced arc/curved shelf rather than a flat row.
    const lift = (1 - absD) * 70;
    // Darker/more muted falloff than a plain opacity fade — the
    // centered card reads bright and lit-up, others flat and dim.
    const opacity = 0.35 + 0.65 * (1 - absD);
    const brightness = 0.55 + 0.45 * (1 - absD);
    const rotateY = d * -14;
    const translateZ = -absD * 80;
    // In-plane tilt following the arc's tangent.
    const rotateZ = d * -7;

    el.style.transform = `translateY(${-lift}px) scale(${scale}) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateZ(${translateZ}px)`;
    el.style.opacity = String(opacity);
    el.style.zIndex = String(Math.round((1 - absD) * 100));
    el.style.filter =
      absD > 0.15
        ? `blur(${(absD * 1.5).toFixed(1)}px) brightness(${brightness.toFixed(2)})`
        : `brightness(${brightness.toFixed(2)})`;

    const ring = glowRings.current[i];
    if (ring) ring.style.opacity = String(Math.max(0, 1 - absD * 1.6));
  });
}

function CarouselCard({
  service,
  snap,
  registerCard,
  registerGlow,
}: {
  service: (typeof services)[number];
  snap: boolean;
  registerCard: (el: HTMLDivElement | null) => void;
  registerGlow: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={registerCard}
      className={`relative h-[24rem] w-72 shrink-0 will-change-transform sm:h-[28rem] sm:w-80 ${
        snap ? "snap-center [scroll-snap-stop:always]" : ""
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Neon ring, only around the active/centered card — sits outside
         the card's own overflow-hidden so it isn't clipped; opacity
         driven per-frame by applyCardTransforms(). */}
      <div
        ref={registerGlow}
        aria-hidden="true"
        className="glow-ring pointer-events-none absolute -inset-1 rounded-[2.6rem] opacity-0"
      />
      <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] bg-blue p-8 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4),0_40px_80px_-28px_rgba(0,0,0,0.55)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-8 select-none text-[7rem] font-black leading-none text-white/10 sm:text-[9rem]"
        >
          {service.id}
        </span>
        <div className="relative flex h-full flex-col justify-start">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden="true" />[ {service.id} ]
          </span>
          <h3 className="mt-4 break-words text-2xl font-bold leading-tight tracking-tight text-white">
            {service.title}
          </h3>
          <p className="mt-3 max-w-xs break-words text-sm leading-relaxed text-white/80">
            {service.shortDesc}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Reduced-motion fallback: a real, native horizontally-scrolling row —
 * `overflow-x: auto` + `scroll-snap-type: x mandatory` +
 * `scroll-snap-stop: always` on each card, so one card advances per
 * gesture with zero custom event interception. No pin, no scroll-jack:
 * the page's vertical scroll and this row's horizontal scroll are
 * independent axes.
 */
function NativeCarouselRow({ cardRefs, glowRingRefs }: { cardRefs: CardRefs; glowRingRefs: CardRefs }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let rafId = 0;

    function update() {
      rafId = 0;
      if (!scroller) return;
      const rect = scroller.getBoundingClientRect();
      applyCardTransforms(cardRefs, glowRingRefs, rect.left + rect.width / 2);
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    }

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Convenience for a plain (non-trackpad) mouse wheel, which has no
    // native horizontal axis of its own: redirect vertical wheel input
    // into horizontal scroll while hovering the row. A trackpad's own
    // horizontal swipe already scrolls the row natively without this.
    function onWheel(e: WheelEvent) {
      if (!scroller || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = scroller.scrollLeft <= 0;
      const atEnd = scroller.scrollLeft >= scroller.scrollWidth - scroller.clientWidth - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      scroller.scrollBy({ left: e.deltaY });
    }
    scroller.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onScroll);
    };
  }, [cardRefs, glowRingRefs]);

  return (
    <>
      <ServicesHeading />
      <div className="relative py-10 sm:py-16">
        <ServicesArcGlow />
        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto pt-20 pb-8"
          style={{ perspective: "1600px" }}
        >
          {/* Spacer cells so the first/last card can scroll all the way to
             true center — without these, native scroll can only bring an
             edge card's own edge to the container's edge, not its center. */}
          <div aria-hidden="true" className="w-[calc(50%-144px)] shrink-0 sm:w-[calc(50%-160px)]" />
          <div className="flex items-center gap-14">
            {services.map((service, i) => (
              <CarouselCard
                key={service.slug}
                service={service}
                snap
                registerCard={(el) => {
                  cardRefs.current[i] = el;
                }}
                registerGlow={(el) => {
                  glowRingRefs.current[i] = el;
                }}
              />
            ))}
          </div>
          <div aria-hidden="true" className="w-[calc(50%-144px)] shrink-0 sm:w-[calc(50%-160px)]" />
        </div>
      </div>
    </>
  );
}

/**
 * Full-motion mode: pins (GSAP ScrollTrigger `pin: true`) once its top
 * hits the viewport top, and the card track's `x` is scrubbed 1:1 against
 * scroll progress until the last card reaches center, at which point it
 * unpins and the page continues — reversing cleanly on scroll-up since a
 * scrubbed tween is just scroll-position-driven, no direction branch
 * needed. `end`/`x` are functions (with `invalidateOnRefresh`) so
 * resize/font-swap recomputes the pin distance instead of a manual
 * ResizeObserver rebuild.
 *
 * The pin target (`pinRef`) wraps the heading *and* the card row, not
 * just the row — so the heading rides along pinned in place for the
 * whole scrub instead of scrolling off before the cards even start
 * moving. `rowRef`/`trackRef` (a level deeper) still drive the actual
 * distance/centering math, unchanged by that wrapping.
 *
 * This *is* the pin-and-scroll-jack idea a previous version of this
 * carousel attempted — that one hand-rolled it with wheel/touch listeners
 * and Lenis stop()/start() coordination and went through many rounds of
 * edge-case bugs (spurious unpinning, trackpad momentum swallowing the
 * next swipe, auto-advance on entry). The difference here is using GSAP
 * ScrollTrigger's own pin+scrub primitives instead of reimplementing scroll
 * capture by hand — Lenis already feeds ScrollTrigger via
 * `lenis.on("scroll", ScrollTrigger.update)` in SmoothScrollProvider, so
 * this needs no custom wheel/touch interception at all.
 */
function PinnedCarouselRow({ cardRefs, glowRingRefs }: { cardRefs: CardRefs; glowRingRefs: CardRefs }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const pinEl = pinRef.current;
    const row = rowRef.current;
    const track = trackRef.current;
    if (!pinEl || !row || !track) return;

    function distance() {
      return Math.max(0, track!.scrollWidth - row!.clientWidth);
    }

    function updateCards() {
      const rect = row!.getBoundingClientRect();
      applyCardTransforms(cardRefs, glowRingRefs, rect.left + rect.width / 2);
    }

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: pinEl,
        start: "top top",
        end: () => `+=${distance()}`,
        // A number (not `true`) — GSAP only builds its internal catch-up
        // tween, and therefore only ever fires `onScrubComplete` below,
        // when `scrub` is numeric. The value itself is a light smoothing
        // lag on the card motion, independent of Lenis's own scroll easing.
        scrub: 0.3,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: updateCards,
        onRefresh: updateCards,
        // Free-scrub while the user is actively scrolling; once they stop
        // (this fires ~0.3s after the last scroll update, so it naturally
        // waits out Lenis's own momentum first), animate to the nearest of
        // the (n-1) even steps between card centers via `lenis.scrollTo()`
        // — not GSAP's own built-in `snap`, which sets scroll position
        // directly and gets silently overwritten by Lenis on its next
        // rAF tick since Lenis, not the browser, owns scroll position here.
        onScrubComplete: (self) => {
          const steps = services.length - 1;
          const snapProgress = Math.round(self.progress * steps) / steps;
          const target = self.start + (self.end - self.start) * snapProgress;
          if (Math.abs(target - window.scrollY) < 1) return;
          getLenis()?.scrollTo(target, { duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
        },
      },
    });

    updateCards();
    ScrollTrigger.refresh();

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [cardRefs, glowRingRefs]);

  return (
    <div ref={pinRef} className="relative">
      <ServicesHeading />
      <div className="relative py-10 sm:py-16">
        <ServicesArcGlow />
        {/* pt-28 (112px): the centered card's real upward reach is more
           than the 70px `lift` alone — `scale(1.1)` grows the box from its
           center, so half the height gain (~22px at h-28rem) also pushes
           the top edge up, ~92px total. Needs to clear that everywhere or
           this row's own overflow-hidden (required to clip the
           wider-than-viewport track) clips the lifted card's top instead. */}
        <div ref={rowRef} className="overflow-hidden pb-8 pt-28">
          <div
            ref={trackRef}
            className="flex w-max items-center gap-14 pl-[calc(50%-144px)] pr-[calc(50%-144px)] will-change-transform sm:pl-[calc(50%-160px)] sm:pr-[calc(50%-160px)]"
            style={{ perspective: "1600px" }}
          >
            {services.map((service, i) => (
              <CarouselCard
                key={service.slug}
                service={service}
                snap={false}
                registerCard={(el) => {
                  cardRefs.current[i] = el;
                }}
                registerGlow={(el) => {
                  glowRingRefs.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesCarousel() {
  const reduced = useReducedMotion();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRingRefs = useRef<(HTMLDivElement | null)[]>([]);

  return reduced ? (
    <NativeCarouselRow cardRefs={cardRefs} glowRingRefs={glowRingRefs} />
  ) : (
    <PinnedCarouselRow cardRefs={cardRefs} glowRingRefs={glowRingRefs} />
  );
}
