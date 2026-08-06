"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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

const segments: { label: string; items: string[] }[] = [
  {
    label: "Digital-First Businesses",
    items: ["Ecommerce", "SaaS & Tech", "Media & Entertainment", "Gaming & Apps", "Subscription Platforms"],
  },
  {
    label: "Service & Experience-Led",
    items: [
      "Healthcare & Wellness",
      "Fashion & Beauty",
      "Food & Beverage",
      "Travel & Hospitality",
      "Fitness & Sports",
      "Beauty & Spa",
      "Events & Entertainment",
    ],
  },
  {
    label: "Property & Physical Goods",
    items: ["Real Estate", "Automotive", "Retail", "Home & Lifestyle", "Manufacturing", "Construction & Interiors"],
  },
  {
    label: "Regulated & Relationship-Driven",
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
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Lazy-initialized (not a plain `false` default) — starting false and
  // correcting in an effect meant the very first paint briefly rendered
  // collapsed cards un-rotated at full size before snapping into place.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    // Row-vs-stack layout switches at md (768px) — the flexGrow/flexBasis width
    // animation below only makes sense in the row layout; in the mobile stack
    // it would size main-axis (height), not width.
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Recursive setTimeout (not setInterval) so it re-derives "next" from
  // whatever activeIndex the last click landed on, instead of ticking on a
  // fixed cadence that could fire mid-interaction.
  useEffect(() => {
    if (!inView || !autoplayEnabled || reducedMotion) return;
    const t = setTimeout(() => setActiveIndex((i) => (i + 1) % segments.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [activeIndex, inView, autoplayEnabled, reducedMotion]);

  function handleClick(i: number) {
    if (i === activeIndex) return;
    setAutoplayEnabled(false);
    setActiveIndex(i);
  }

  return (
    <section ref={sectionRef} className="border-t border-line px-6 py-8 sm:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p
            className="mb-4 font-semibold uppercase tracking-[0.12em] text-ink"
            style={{ fontSize: "1.5rem" }}
          >
            26 industries, one standard
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
                  transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S, ease: LIQUID_EASE }}
                  className="group relative w-full shrink-0 overflow-hidden rounded-[22px] border border-line bg-white text-left"
                >
                  {/* Faint decorative texture — collapsed: soft grey blob; expanded: white wave + sparkle */}
                  {!isActive && (
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full blur-2xl" style={blobStyle(i)} />
                  )}

                  {/* Fill cross-fades in/out instead of the background snapping between
                      solid white and solid blue (colors framer can't tween across). */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "var(--blue)" }}
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0 }}
                    transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S * 0.6, ease: EASE }}
                  />

                  <button
                    type="button"
                    onClick={() => handleClick(i)}
                    aria-expanded={isActive}
                    className={`relative z-10 flex h-full w-full flex-col p-6 text-left ${
                      !isActive ? "md:px-2" : ""
                    }`}
                  >
                    <div className="relative flex h-full min-h-[88px] flex-col md:h-[360px]">
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
                          transition={{ duration: reducedMotion ? 0 : 0.3, ease: EASE }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </motion.span>

                        {/* Same headline element throughout — collapsed "vertical" is a real
                            rotate(-90deg) transform on normal horizontal text (writing-mode can't
                            be animated), so it visibly rotates+scales in place instead of one text
                            fading out while a different one fades in. The wrapper's own layout
                            strategy still differs per state, though: expanded stays in normal flow
                            (top-left, next to the number, like a regular heading); collapsed
                            switches to an absolute-fill flexbox that centers on BOTH axes — that's
                            deliberate, not an inconsistency: flexbox centering is content-length
                            aware (it centers whatever the label's actual rendered box turns out to
                            be), where a hand-picked fixed left/top offset isn't — a hardcoded
                            anchor point centers a short label like "Legal" correctly but leaves a
                            long one like "Regulated & Relationship-Driven" off-center. */}
                        <div
                          className={
                            isActive
                              ? "min-h-[1.75em] w-full md:mt-4"
                              : "md:absolute md:inset-0 md:flex md:items-center md:justify-center"
                          }
                        >
                          <motion.span
                            initial={false}
                            animate={{
                              rotate: isDesktop ? (isActive ? 0 : -90) : 0,
                              scale: isDesktop ? (isActive ? 1.25 : 0.4) : 1,
                              color: isActive ? "#FFFFFF" : "#1A1A1A",
                            }}
                            transition={{ duration: reducedMotion ? 0 : WIDTH_TRANSITION_S, ease: LIQUID_EASE }}
                            // Expanded scales up from its own left edge (stays anchored to the
                            // card's padding, grows rightward) — the default center origin scaled
                            // it outward in both directions, pushing the left side of the text
                            // past the card boundary and clipping it. Collapsed keeps center since
                            // it's flex-centered by its wrapper, not left-anchored.
                            style={{ transformOrigin: isActive ? "left center" : "center" }}
                            className={`block whitespace-nowrap font-bold tracking-tight md:text-4xl ${
                              isActive ? "text-2xl" : "text-base"
                            }`}
                          >
                            {segment.label}
                          </motion.span>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={reducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.15 } }}
                            // min-h-0 overrides the flex-item default (min-height: auto), which
                            // otherwise refuses to shrink below its content size — without it this
                            // panel ignored the card's fixed height and got hard-clipped by the
                            // card's own overflow-hidden instead of scrolling internally.
                            className="mt-5 min-h-0 flex-1 overflow-y-auto"
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
