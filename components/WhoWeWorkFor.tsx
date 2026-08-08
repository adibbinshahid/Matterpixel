"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView, type Variants } from "motion/react";
import {
  Briefcase,
  Car,
  Cpu,
  Dumbbell,
  Factory,
  Film,
  Flower2,
  Gamepad2,
  GraduationCap,
  HardHat,
  Heart,
  HeartHandshake,
  Home,
  Landmark,
  type LucideIcon,
  PartyPopper,
  Plane,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sofa,
  Store,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { EASE } from "@/lib/utils";

const HOLD_MS = 2000;
const START_DELAY_MS = 2000;
const CLICK_PAUSE_MS = 15000;
const WIDTH_TRANSITION_S = 0.85;
// Slow expo-out — decelerates gradually all the way to rest instead of
// settling early, which is what reads as "liquid" rather than mechanical.
const LIQUID_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const iconFor: Record<string, LucideIcon> = {
  Ecommerce: ShoppingCart,
  "SaaS & Tech": Cpu,
  "Media & Entertainment": Film,
  "Gaming & Apps": Gamepad2,
  "Subscription Platforms": RefreshCw,
  "Healthcare & Wellness": Heart,
  "Fashion & Beauty": ShoppingBag,
  "Food & Beverage": Utensils,
  "Travel & Hospitality": Plane,
  "Fitness & Sports": Dumbbell,
  "Beauty & Spa": Flower2,
  "Events & Entertainment": PartyPopper,
  "Real Estate": Home,
  Automotive: Car,
  Retail: Store,
  "Home & Lifestyle": Sofa,
  Manufacturing: Factory,
  "Construction & Interiors": HardHat,
  "Finance & Fintech": Landmark,
  Legal: Scale,
  "Education & EdTech": GraduationCap,
  "Non-Profits": HeartHandshake,
  "Professional Services": Briefcase,
  "Logistics & Supply Chain": Truck,
  "Agencies & Consultancies": Users,
  Insurance: ShieldCheck,
};

const segments: { label: string; items: string[]; image: string }[] = [
  {
    label: "Digital-First",
    items: ["Ecommerce", "SaaS & Tech", "Media & Entertainment", "Gaming & Apps", "Subscription Platforms"],
    image: "/WhoWeWorkFor/Digital First Businesses.webp",
  },
  {
    label: "Service & Experience",
    items: [
      "Healthcare & Wellness",
      "Fashion & Beauty",
      "Food & Beverage",
      "Travel & Hospitality",
      "Fitness & Sports",
      "Beauty & Spa",
      "Events & Entertainment",
    ],
    image: "/WhoWeWorkFor/Services businesses.webp",
  },
  {
    label: "Property & Physical Goods",
    items: ["Real Estate", "Automotive", "Retail", "Home & Lifestyle", "Manufacturing", "Construction & Interiors"],
    image: "/WhoWeWorkFor/Property & physical goods.webp",
  },
  {
    label: "Relationship-Driven",
    items: [
      "Finance & Fintech",
      "Legal",
      "Education & EdTech",
      "Non-Profits",
      "Professional Services",
      "Logistics & Supply Chain",
      "Agencies & Consultancies",
      "Insurance",
    ],
    image: "/WhoWeWorkFor/regulated and relationshion driven.webp",
  },
];

const listContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: WIDTH_TRANSITION_S * 0.7 } },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
};

/** Deterministic per-index pseudo-randomness (no Math.random — must render
 * identically on server and client) for the faint collapsed-card blobs. */
function blobStyle(i: number): CSSProperties {
  const angle = (i * 47) % 360;
  return {
    background: `radial-gradient(circle at ${30 + ((i * 23) % 40)}% ${20 + ((i * 31) % 50)}%, color-mix(in srgb, var(--ink-soft) 14%, transparent) 0%, transparent 65%)`,
    transform: `rotate(${angle}deg)`,
  };
}

export function WhoWeWorkFor() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.3 });

  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Timestamp until which autoplay ticks are skipped (set by a click).
  // Scrolling away clears it, so leaving and coming back always resumes
  // autoplay rather than staying stuck on whatever was last clicked.
  const pausedUntilRef = useRef(0);
  // Plain `false` default so the client's first render matches the server's
  // (SSR never knows viewport width) — hydration would otherwise mismatch
  // whenever the client's initial value differed from `false`. Corrected in
  // a layout effect (fires before paint) rather than a plain effect, so
  // there's still no visible flash of un-rotated collapsed cards.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useLayoutEffect(() => {
    // Row-vs-stack layout switches at md (768px) — the flexGrow/flexBasis width
    // animation below only makes sense in the row layout; in the mobile stack
    // it would size main-axis (height), not width.
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Plain interval (not recursive setTimeout) so a click's pause doesn't
  // need to tear down/recreate the ticker — it just tells this interval to
  // skip ticks until `pausedUntilRef` elapses. Leaving the section clears
  // the pause outright, so autoplay is always back on by the time it's
  // scrolled back into view.
  useEffect(() => {
    if (!inView) {
      pausedUntilRef.current = 0;
      return;
    }
    if (reducedMotion) return;
    // Wait a beat after scrolling in before autoplay kicks off, so the
    // section doesn't start animating the instant it's crossed into view.
    const startTimeout = setTimeout(() => {
      pausedUntilRef.current = 0;
    }, START_DELAY_MS);
    pausedUntilRef.current = Date.now() + START_DELAY_MS;
    const interval = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActiveIndex((i) => (i + 1) % segments.length);
    }, HOLD_MS);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [inView, reducedMotion]);

  function handleClick(i: number) {
    if (i === activeIndex) return;
    setActiveIndex(i);
    pausedUntilRef.current = Date.now() + CLICK_PAUSE_MS;
  }

  return (
    <section ref={sectionRef} className="border-t border-line px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p
            className="mb-4 font-semibold uppercase tracking-[0.12em] text-ink"
            style={{ fontSize: "1.5rem" }}
          >
            Service ACROSS EVERY INDUSTRY
          </p>
          <h2>
            <GiantHeading
              lines={["wherever you build, we understand it."]}
              highlight="we understand it"
            />
          </h2>
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex items-center justify-center gap-2" aria-hidden="true">
          {segments.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full transition-all duration-300"
              style={
                i === activeIndex
                  ? { width: "1.25rem", backgroundColor: "var(--magenta)" }
                  : { backgroundColor: "color-mix(in srgb, var(--ink-soft) 35%, transparent)" }
              }
            />
          ))}
        </div>

        <div className="relative mt-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-3">
            {segments.map((segment, i) => {
              const isActive = reducedMotion ? i === 0 : i === activeIndex;
              // Width-only tween on explicit flex properties (grow/basis) — no `layout`
              // prop here, since its automatic FLIP also interpolates height, and a
              // fixed-height row with `items-stretch` meant that whenever the active
              // card's own content momentarily reflowed, FLIP read it as "the whole
              // row resized" and animated every card's height too. This way only
              // width can ever change; height is pinned by the fixed h-[...] below.
              return (
                <motion.div
                  key={segment.label}
                  initial={false}
                  animate={
                    isDesktop
                      ? { flexGrow: isActive ? 1 : 0, flexBasis: isActive ? "0%" : "64px" }
                      : { flexGrow: 0, flexBasis: "auto" }
                  }
                  transition={{
                    duration: reducedMotion ? 0 : WIDTH_TRANSITION_S,
                    ease: LIQUID_EASE,
                    // Collapsing card: hold its width for one beat (matching the industries
                    // list's own 0.15s exit fade below) before shrinking — without this, the
                    // card visibly narrows WHILE the still-fading-out list is reflowing its grid
                    // columns to the shrinking width underneath it, which read as the list
                    // "jumping to another spot" for a moment. Expanding card still grows
                    // immediately (delay 0) so clicks feel instant, not laggy.
                    delay: reducedMotion || isActive ? 0 : 0.15,
                  }}
                  className="group relative w-full shrink-0 overflow-hidden rounded-[22px] text-left transition-shadow duration-500"
                  style={{
                    // Glass base — semi-transparent tonal gradient (not flat white) so the
                    // faint blob + backdrop-blur underneath read through, plus a layered
                    // shadow stack: outer ambient shadow for lift, inset top highlight for
                    // a "light hitting glass" edge, inset bottom shade for depth — this
                    // combination is what reads as Apple-style frosted glass rather than a
                    // flat card. Fades out with everything else when the card goes active,
                    // since the opaque blue fill/photo sit above it at that point anyway.
                    background:
                      "linear-gradient(165deg, color-mix(in srgb, white 92%, transparent) 0%, color-mix(in srgb, white 65%, transparent) 100%)",
                    backdropFilter: "blur(20px) saturate(160%)",
                    WebkitBackdropFilter: "blur(20px) saturate(160%)",
                    boxShadow: isActive
                      ? "none"
                      : "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -1px 1px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(255,255,255,0.6), 0 18px 40px -16px rgba(15,15,35,0.22), 0 4px 10px -4px rgba(15,15,35,0.1)",
                  }}
                >
                  {/* Faint decorative collapsed-card blob — cross-fades with opacity (like the
                      blue fill below) instead of mounting/unmounting, so it doesn't pop. */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full blur-2xl"
                    style={blobStyle(i)}
                    initial={false}
                    animate={{ opacity: isActive ? 0 : 1 }}
                    transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.6, ease: LIQUID_EASE }}
                  />

                  {/* Top glass sheen — soft diagonal highlight band, the "light catching the
                      curved glass edge" cue that sells the premium 3D-glass read. */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 28%, transparent 55%)",
                    }}
                    initial={false}
                    animate={{ opacity: isActive ? 0 : 1 }}
                    transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.6, ease: LIQUID_EASE }}
                  />

                  {/* Fill cross-fades in/out instead of the background snapping between
                      solid white and solid blue (colors framer can't tween across). Sits
                      under the photo as a color fallback while the image loads/fades. */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "var(--blue)" }}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.6, ease: LIQUID_EASE }}
                  />

                  {/* Relevant-to-segment photo, only on the expanded card. Slightly blurred +
                      scaled up (so the blur doesn't reveal transparent edges) for a soft,
                      editorial backdrop rather than a sharp photo competing with the text. */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${encodeURI(segment.image)})`,
                      filter: "blur(2px)",
                      transform: "scale(1.03)",
                    }}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.6, ease: LIQUID_EASE }}
                  />

                  {/* Scrim over the photo — darkens + tints it toward the brand blue so the
                      white number/title/list text stays reliably legible over any photo. */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--blue) 55%, black 25%) 0%, color-mix(in srgb, var(--blue) 60%, black 45%) 100%)",
                    }}
                    initial={false}
                    animate={{ opacity: isActive ? 0.82 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.6, ease: LIQUID_EASE }}
                  />

                  <button
                    type="button"
                    onClick={() => handleClick(i)}
                    aria-expanded={isActive}
                    className={`relative z-10 flex h-full w-full flex-col p-6 text-left ${
                      !isActive ? "md:px-2" : ""
                    }`}
                  >
                    <div className="relative flex h-full min-h-[88px] flex-col md:h-[250px]">
                      <div
                        className={`flex items-start justify-between gap-3 ${
                          isActive ? "md:flex-col md:items-start" : ""
                        }`}
                      >
                        {/* Number and title are each independently absolute-positioned off the
                            card (not off each other) when collapsed, so every card's number sits
                            at the exact same pinned spot regardless of what the title does. */}
                        <motion.span
                          className={`text-xs font-semibold ${
                            !isActive ? "md:absolute md:left-1/2 md:top-6 md:-translate-x-1/2" : ""
                          }`}
                          initial={false}
                          animate={{
                            color: isActive ? "rgba(255,255,255,0.75)" : "color-mix(in srgb, var(--ink-soft) 60%, transparent)",
                          }}
                          transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.4, ease: LIQUID_EASE }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </motion.span>

                        {/* Same headline element throughout — collapsed "vertical" is a real
                            rotate(-90deg) transform on normal horizontal text (writing-mode can't
                            be animated), so it visibly rotates+scales in place instead of one text
                            fading out while a different one fades in.
                            The wrapper is `md:absolute` UNCONDITIONALLY (static classes, never
                            toggled by state) — position/size instead animate as plain numeric
                            top/left/width/height percentages via Framer's `animate`. Deliberately
                            NOT the `layout` prop: `layout` measures via getBoundingClientRect and
                            FLIPs based on that, but the ANCESTOR card is simultaneously resizing
                            via its own plain `animate` (flexGrow/flexBasis) over the same duration
                            — a layout child whose ancestor is mid-resize gets corrupted
                            measurements, which is what caused the jump/pop instead of a clean
                            transition. Plain property tweening has no such dependency on ancestor
                            geometry, so it stays smooth regardless of what the card around it is
                            doing. Collapsed centers within the full card (100%/100%); expanded
                            centers within a top-left band (70%/44%) — both use identical
                            items-center/justify-center, so only the band's size and position need
                            to move, never the alignment rule itself. */}
                        <motion.div
                          initial={false}
                          animate={
                            isDesktop
                              ? { top: "0%", left: "0%", width: isActive ? "70%" : "100%", height: isActive ? "28%" : "100%" }
                              : {}
                          }
                          transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S, ease: LIQUID_EASE }}
                          // justify-center for both would center the expanded headline inside its
                          // own 70%-wide band — off from both the card's true center and the
                          // number's left edge, landing it looking arbitrarily off-to-one-side.
                          // justify-start for active left-aligns it flush with the band's left
                          // edge, which sits at the same padding inset as the number above it.
                          // This is a plain CSS class swap (no `layout` prop involved), so it
                          // can't reintroduce the ancestor-resize FLIP conflict — it doesn't touch
                          // the top/left/width/height tween at all.
                          className={`min-h-[1.75em] w-full md:absolute md:flex md:items-center ${
                            isActive ? "md:justify-start" : "md:justify-center"
                          }`}
                        >
                          <motion.span
                            initial={false}
                            animate={{
                              rotate: isDesktop ? (isActive ? 0 : -90) : 0,
                              scale: isDesktop ? (isActive ? 1.25 : 0.4) : 1,
                              color: isActive ? "#FFFFFF" : "#1A1A1A",
                            }}
                            transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S, ease: LIQUID_EASE }}
                            // Default transform-origin is the span's own center — scaling up from
                            // center pushes the left edge outward past the band's left-aligned
                            // start (and off the card), which is exactly what was clipping "S" off
                            // "Service...". Left-anchored content needs a left-anchored scale
                            // origin so it only grows rightward. Collapsed keeps center since it's
                            // still center-justified within its own full-card band.
                            style={{
                              transformOrigin: isActive ? "left center" : "center",
                              textShadow: isActive ? "0 2px 12px rgba(0,0,0,0.35)" : undefined,
                            }}
                            // whitespace-nowrap only for collapsed — that's the vertical-rl case
                            // where the browser's shrink-to-fit width otherwise wraps long labels
                            // into several short columns. Expanded is normal horizontal text; if
                            // the longest label doesn't fit the active card's width at this scale,
                            // wrapping to a second line is the correct, unsurprising behavior for
                            // a heading — forcing nowrap there risked clipping it instead.
                            className={`block font-bold tracking-tight md:text-4xl ${
                              isActive ? "text-2xl text-left" : "text-base whitespace-nowrap"
                            }`}
                          >
                            {segment.label}
                          </motion.span>
                        </motion.div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={false}
                            exit={reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                            // No entry animation of its own — the inner grid's staggered fade-in
                            // (delayChildren below) is the entrance; a second independent fade here
                            // used to run on its own un-delayed default timing, so the panel was
                            // fully visible (just empty) well before the card had finished
                            // widening, and the stagger and the width animation visibly raced.
                            //
                            // min-h-0 overrides the flex-item default (min-height: auto), which
                            // otherwise refuses to shrink below its content size — without it this
                            // panel ignored the card's fixed height and got hard-clipped by the
                            // card's own overflow-hidden instead of scrolling internally.
                            className="mt-5 min-h-0 flex-1 overflow-y-auto md:absolute md:inset-x-0 md:bottom-0 md:top-[32%] md:mt-0"
                          >
                            <motion.div
                              variants={listContainer}
                              initial={reducedMotion ? "visible" : "hidden"}
                              animate="visible"
                              className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"
                            >
                              {segment.items.map((item) => {
                                const Icon = iconFor[item];
                                return (
                                  <motion.span
                                    key={item}
                                    variants={reducedMotion ? undefined : listItem}
                                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
                                    className="flex items-center gap-2 text-base leading-snug text-white sm:text-lg lg:text-xl"
                                  >
                                    <Icon className="h-5 w-5 shrink-0 opacity-80" />
                                    {item}
                                  </motion.span>
                                );
                              })}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
