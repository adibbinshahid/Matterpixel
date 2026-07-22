"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { services } from "@/content/services";
import { servicesIntro, servicesCta } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DURATIONS } from "@/lib/utils";

const MOBILE_BREAKPOINT = 768; // matches the site's shared `md` breakpoint
const ACTIVE_SCALE = 1.16; // how much bigger the centered card is than a resting one
const CARD_WIDTH = 320; // px — matches the sm:w-80 card class below
const CARD_GAP = 32; // px — matches the gap-8 track class below
const CARD_STEP = CARD_WIDTH + CARD_GAP;
// Fraction of a full viewport-height of scroll spent traveling between one
// card and the next — short on purpose, so cards glide past quickly
// rather than a long haul per card.
const SCROLL_PER_CARD = 0.3;
// Pinned stage is a full h-screen box so the cards — vertically centered
// within it — always sit at the true vertical center of the actual
// screen, at any viewport height, not just centered within some smaller
// fitted box.
const PINNED_HEIGHT_VH = 100;

/**
 * Fits every line to a single uniform font-size sized so the WIDEST line
 * spans exactly the full width of its container — real canvas text
 * measurement (same technique as FeatureStrip.tsx), not a guessed clamp(),
 * so "End-to-end solutions." genuinely reaches edge-to-edge at any
 * viewport width instead of an approximation that's only right sometimes.
 */
function GiantHeading({ lines }: { lines: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!el || !ctx) return;

    function update() {
      if (!el || !ctx) return;
      const cw = el.clientWidth;
      const bodyFont = getComputedStyle(document.body).fontFamily;
      const REF = 100;
      ctx.font = `800 ${REF}px ${bodyFont}`;
      const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
      setFontSize(widest > 0 ? (cw / widest) * REF : REF);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines]);

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

/**
 * A seamless horizontal carousel of 6 service cards, driven by vertical
 * scroll: the card nearest the center of the screen is always the biggest
 * and sharpest, and the whole row glides continuously (never a discrete
 * jump-cut) as scroll advances, handing off center-stage to the next card
 * in line. Once the last card has had its turn, the section releases into
 * normal scroll.
 *
 * Gated on prefers-reduced-motion AND a `md`-and-up viewport, same
 * reasoning as Process.tsx's pinned journey — pinned scroll-jacking is
 * fragile on mobile and has no way to be verified on real device jank
 * here, so narrow viewports get a plain stacked fallback instead.
 */
export function ServicesFold() {
  const reduced = useReducedMotion();
  const [showPinned, setShowPinned] = useState(true);

  useEffect(() => {
    const update = () => setShowPinned(!reduced && window.innerWidth >= MOBILE_BREAKPOINT);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [reduced]);

  return (
    <section id="services" className="panel-dark relative border-t border-line">
      {/* Same margin recipe as Nav's own pill (px-4 sm:px-6 outer gutter,
         max-w-[1400px] centered) so the giant heading's edges line up with
         the nav bar's, instead of running to the true screen edge. */}
      <div className="px-4 pb-4 pt-28 sm:px-6 sm:pb-5 sm:pt-28">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <GiantHeading lines={servicesIntro.headingLines} />
          </Reveal>
        </div>
      </div>

      {showPinned ? <CardStage /> : <FallbackGrid />}

      {/* Its own full-bleed section now (not an inset card floating inside
         another section) — same edge-to-edge treatment as Stats.tsx's
         bg-blue, with the actual text/button content still constrained by
         the standard section-shell margin. */}
      <div className="relative overflow-hidden bg-blue">
        <div className="section-shell section-py-standard">
          <Reveal duration={DURATIONS.standard} delay={0.1}>
            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                {/* Explicit white/black here, not the text-paper/bg-paper
                   tokens — this banner sits inside the outer panel-dark
                   section, which reassigns exactly those tokens to their
                   dark-mode values, flipping this "light text + white
                   pill on blue" banner backwards into black text on blue
                   with a black button. */}
                <h3 className="max-w-lg text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl">
                  {servicesCta.heading.replace(servicesCta.headingHighlight, "").trim()}{" "}
                  <span className="text-magenta">{servicesCta.headingHighlight}</span>
                </h3>
                <p className="mt-3 max-w-md text-white/80">{servicesCta.body}</p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {servicesCta.badges.map((b) => (
                    <span key={b} className="text-sm font-semibold text-white/90">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/contact"
                className="hover-lift font-avenir group inline-flex w-fit items-center gap-2 rounded-full bg-white px-7 py-4 text-sm text-black"
              >
                {servicesCta.button}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>

        <div
          className="pointer-events-none absolute bottom-0 right-0 grid grid-cols-6 gap-1 p-6 opacity-70"
          aria-hidden="true"
        >
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={i}
              className="h-3 w-3"
              style={{
                background:
                  i % 3 === 0 ? "var(--paper)" : i % 3 === 1 ? "var(--magenta)" : "transparent",
                opacity: i % 3 === 2 ? 0 : 0.5 + ((i * 7) % 5) / 10,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CardStage() {
  const total = services.length;
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pinned = pinnedRef.current;
    const track = trackRef.current;
    if (!wrap || !pinned || !track) return;

    // Pure function of scroll progress — the track's horizontal position
    // (which card sits center-screen) and each card's own scale/opacity
    // are both just continuous functions of "how far is the current
    // scroll position from my own slot," so the whole row reads as one
    // seamless glide rather than a sequence of discrete steps.
    function update(progress: number) {
      // `progress * total` would put card 0 at d = -0.5 when progress = 0
      // (half-transitioned, not actually centered) and the last card at
      // d = +0.5 when progress = 1 — the section would visibly rest on a
      // dim, off-center, half-scaled card at both the moment it pins and
      // the moment it releases, instead of ever settling cleanly on one.
      // Mapping progress across (total - 1) instead of `total`, offset by
      // 0.5, guarantees card 0 is exactly centered at progress = 0 and the
      // last card is exactly centered at progress = 1.
      const x = 0.5 + progress * (total - 1);
      const viewportW = window.innerWidth;

      // Centers the card at continuous position `x - 0.5` under the
      // viewport's horizontal middle — at x = i + 0.5 (card i's own
      // center, matching the `d` falloff below), this places card i's
      // actual center pixel exactly at viewportW / 2.
      const focusPx = (x - 0.5) * CARD_STEP + CARD_WIDTH / 2;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateY(-50%) translateX(${viewportW / 2 - focusPx}px)`;
      }

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.max(-1, Math.min(1, x - (i + 0.5)));
        const absD = Math.abs(d);
        const scale = 1 + (ACTIVE_SCALE - 1) * (1 - absD);
        const lift = (1 - absD) * 14;
        const opacity = 0.45 + 0.55 * (1 - absD);
        el.style.transform = `translateY(${-lift}px) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(Math.round((1 - absD) * 100));
        el.style.filter = absD > 0.15 ? `blur(${(absD * 1.5).toFixed(1)}px)` : "none";
      });

      if (glowRef.current) {
        const posX = 15 + progress * 70;
        glowRef.current.style.background = `radial-gradient(700px circle at ${posX}% 45%, var(--magenta)26, transparent 70%)`;
      }
    }

    update(0);

    const st = ScrollTrigger.create({
      trigger: wrap,
      pin: pinned,
      start: "top top",
      end: () => `+=${total * window.innerHeight * SCROLL_PER_CARD}`,
      scrub: 0.5,
      anticipatePin: 1,
      // Card slots are evenly spaced across progress (1 / (total - 1) per
      // card, matching the x-mapping above) — snapping to that increment
      // means the moment scrolling lets up, it auto-finishes the glide to
      // whichever card is nearest instead of requiring the visitor to
      // scroll the exact pixel distance to land on one themselves.
      snap: {
        snapTo: 1 / (total - 1),
        duration: { min: 0.2, max: 0.6 },
        ease: "power1.inOut",
      },
      onUpdate: (self) => update(self.progress),
    });

    const onResize = () => update(st.progress);
    window.addEventListener("resize", onResize);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GSAP's pin-spacer reserves the scroll distance (`end`, above) PLUS the
  // pinned element's own natural height (100vh, since it's h-screen) — see
  // the identical fix/comment in Process.tsx, which had this exact bug
  // when this wrapper's height didn't also account for that extra 100vh.
  return (
    <div ref={wrapRef} style={{ height: `${total * 100 * SCROLL_PER_CARD + PINNED_HEIGHT_VH}vh` }}>
      <div ref={pinnedRef} className="relative h-screen overflow-hidden">
        <div ref={glowRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative h-full">
          <div
            ref={trackRef}
            className="absolute left-0 top-1/2 flex items-center gap-8"
            style={{ willChange: "transform" }}
          >
            {services.map((service, i) => (
              <div
                key={service.slug}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="relative h-[24rem] w-72 shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-magenta to-magenta/45 p-8 shadow-[0_30px_80px_-25px_rgba(255,46,147,0.55)] will-change-transform sm:h-[28rem] sm:w-80"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 -top-8 select-none text-[7rem] font-black leading-none text-white/10 sm:text-[9rem]"
                >
                  {service.id}
                </span>
                <div className="relative flex h-full flex-col justify-center">
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** No pinning, no 3D — same six services, plain stacked reveal. Used
 * under prefers-reduced-motion and below the `md` breakpoint. */
function FallbackGrid() {
  return (
    <div className="section-shell pb-20">
      <RevealGroup stagger={0.1} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <RevealItem
            key={service.slug}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-magenta to-magenta/45 p-6 shadow-[0_20px_60px_-20px_rgba(255,46,147,0.5)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-3 -top-6 select-none text-[6rem] font-black leading-none text-white/10"
            >
              {service.id}
            </span>
            <span className="relative inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden="true" />[ {service.id} ]
            </span>
            <h3 className="relative mt-3 text-h3 text-white">{service.title}</h3>
            <p className="relative mt-3 text-sm leading-relaxed text-white/80">{service.shortDesc}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
