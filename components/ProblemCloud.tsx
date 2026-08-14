"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { problemCloudIntro, problemWords, type ProblemSize } from "@/content/problemCloud";
import { GiantHeading } from "@/components/GiantHeading";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Deterministic PRNG (mulberry32) seeded from each phrase's own text —
 * every word needs a stable entrance delay and vertical jitter that's the
 * same on the server and the client (plain `Math.random()` in render
 * would mismatch between the two and trip a hydration error), while
 * still reading as "random" from one phrase to the next. */
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One `rand()` draw from a fresh generator, re-seeded per call site.
 * `Word` derives independent values (entrance delay, jitter) from the
 * same phrase; drawing them off one shared, stateful
 * generator across three separate `useMemo` hooks meant each value's
 * result depended on how many times its *neighbors'* hooks had already
 * advanced that shared generator — consistent within a single render,
 * but not guaranteed to stay in lockstep between React's server render
 * and its client (dev-mode double-invoke) render, which is exactly what
 * was tripping a hydration mismatch. Salting the seed per value instead
 * makes each draw self-contained: idempotent no matter how many times
 * its own factory happens to run. */
function seededRand(seed: number, salt: number) {
  return mulberry32(seed + salt)();
}

/**
 * The lower bound of each clamp is the phone-width size, and it used to be
 * set purely by the tier ratios — which put the M tier at 10px and L at
 * 13px on a 393px screen, i.e. below body copy, in light grey, at angles.
 * The floors are raised so the smallest tier still reads at ~14px; the
 * tiers stay visually ranked, just over a compressed range at the narrow
 * end. The upper bounds (the desktop treatment) are untouched.
 */
const SIZE_CLASS: Record<ProblemSize, string> = {
  xxl: "text-[clamp(1.5rem,0.8rem+2.4vw,2.6rem)] leading-[1.02]",
  xl: "text-[clamp(1.15rem,0.68rem+1.6vw,1.76rem)] leading-[1.04]",
  l: "text-[clamp(1rem,0.58rem+0.96vw,1.24rem)] leading-[1.08]",
  m: "text-[clamp(0.9rem,0.5rem+0.6vw,0.88rem)] leading-[1.12]",
};

/** Tiers dropped below `sm`. Raising the floors above makes every phrase
 * legible but also makes 24 of them far too dense for a phone — the
 * lowest-weight tier sits out on narrow screens, leaving the 15 phrases
 * that carry the section's point. */
const MOBILE_HIDDEN_SIZES: ProblemSize[] = ["m"];

// Rest grey was #C2C2CA — about 1.9:1 on white, under the 3:1 floor for
// large text and genuinely hard to read on a phone held at arm's length.
// Darkened just far enough to clear it while staying clearly recessive
// against the magenta/blue active states.
const REST_COLOR = "#A3A3AF";
const PULSE_COLOR = "#2c4bff";
const HOVER_COLOR = "#ff2e93";

// Dock-style continuous magnification field — every word's scale is a
// smooth function of its own distance from the cursor (or the focused
// word, for keyboard users), not a discrete "hovered vs not" flag. No
// positional drift/push — words only grow in place, they don't chase or
// get shoved by the cursor.
const PEAK_SCALE = 1.2;
// Distance (px) at which a word stops growing at all — also the fixed
// radius the depth-of-field blur below ramps across, so both effects
// share one consistent field size instead of two mismatched radii.
const FIELD_RADIUS_PX = 300;
// Minimum gap (px) enforced between any two words' *actual rendered*
// boxes even at peak magnification — see the collision-safety pass in
// `applyField`.
const COLLISION_MARGIN_PX = 3;

// Depth-of-field blur: the word actually under the cursor (and anything
// within SHARP_RADIUS_PX of it) stays perfectly sharp; beyond that, blur
// ramps up with distance, reaching MAX_BLUR_PX exactly at the edge of
// FIELD_RADIUS_PX and never growing past it — the same fixed radius as
// the magnification, not an independent, wider fade.
const SHARP_RADIUS_PX = 70;
const MAX_BLUR_PX = 3.5;

function blurForDistance(distance: number) {
  if (distance <= SHARP_RADIUS_PX) return 0;
  const t = Math.min(1, (distance - SHARP_RADIUS_PX) / (FIELD_RADIUS_PX - SHARP_RADIUS_PX));
  return t * MAX_BLUR_PX;
}

/** Straight-line distance from a point to the *nearest edge* of a rect
 * (0 if the point is inside it) — not to its center. Blur needs this,
 * not the center-to-center distance the scale falloff uses: a long
 * phrase's center can sit well outside the cursor's radius while its
 * near edge is right next to it (or the reverse, for a short word whose
 * center happens to be close). Measuring from the actual occupied box
 * is what makes the blur read as one clean circular radius around the
 * cursor regardless of how large or small an individual word is,
 * instead of the depth-of-field effectively varying by word size. */
function distanceToRect(px: number, py: number, rect: { left: number; right: number; top: number; bottom: number }) {
  const dx = Math.max(rect.left - px, 0, px - rect.right);
  const dy = Math.max(rect.top - py, 0, py - rect.bottom);
  return Math.hypot(dx, dy);
}

// Row gap (see the cloud's `gap-y-*` classes below) is kept at more than
// 2x this so idle jitter alone can never close a row gap to zero — see
// the comment on `jitterY`.
const JITTER_MAX = 4;

const INDICES_BY_SIZE: Record<ProblemSize, number[]> = { xxl: [], xl: [], l: [], m: [] };
problemWords.forEach((word, i) => INDICES_BY_SIZE[word.size].push(i));

/** Ambient blue pulse should read as "the big problems glow most": 50% of
 * pulses land on an XXL/XL phrase, 50% on L/M — rather than a flat pick
 * across all words, which would make the smaller tier flash blue just
 * as often as the headline-scale phrases. */
const PULSE_GROUPS: ProblemSize[][] = [
  ["xxl", "xl"],
  ["l", "m"],
];
function pickPulseIndex() {
  const r = Math.random();
  const group = r < 0.5 ? PULSE_GROUPS[0] : PULSE_GROUPS[1];
  const pool = group.flatMap((size) => INDICES_BY_SIZE[size]);
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Half-cosine falloff — 1 at distance 0, smoothly down to 0 at
 * `FIELD_RADIUS_PX`. Same shape a Dock magnification curve uses: no
 * kink at the center, no hard edge at the radius, just one continuous
 * bump. */
function falloff(distance: number) {
  if (distance >= FIELD_RADIUS_PX) return 0;
  return (1 + Math.cos((Math.PI * distance) / FIELD_RADIUS_PX)) / 2;
}

/**
 * One phrase in the cloud. Two layers:
 *
 * - The outer `motion.span` is Framer-owned and only ever does two
 *   things, once each: the entrance pop (scale 0→1) and holding the
 *   word's constant resting `jitterY`. It never touches the DOM again
 *   after that settles, which is what makes it safe for the inner layer
 *   to take over.
 * - The inner `span` is the Dock layer: its `transform`/`color`/
 *   `font-weight`/`filter` are written *imperatively* (via `innerRef`,
 *   from `ProblemCloud`'s mousemove handler), not through React state. A
 *   cursor-follow effect has to recompute every word's worth of
 *   scale/color/blur on every animation frame — routing that through
 *   React state would mean a full re-render of the cloud per frame.
 *   Writing `style` directly on cached refs is the same technique
 *   GSAP/native perf-critical animation code uses, and it's the only way
 *   this stays GPU-cheap at this element count and 60fps.
 */
function Word({
  text,
  size,
  index,
  inView,
  reduced,
  pulsing,
  outerRef,
  innerRef,
  onFocusWord,
  onBlurWord,
}: {
  text: string;
  size: ProblemSize;
  index: number;
  inView: boolean;
  reduced: boolean;
  pulsing: boolean;
  outerRef: (el: HTMLSpanElement | null) => void;
  innerRef: (el: HTMLSpanElement | null) => void;
  onFocusWord: (i: number) => void;
  onBlurWord: () => void;
}) {
  const seed = useMemo(() => hashString(text), [text]);
  const entranceDelay = useMemo(() => seededRand(seed, 1) * 1.1, [seed]);
  // Vertical jitter so phrases don't sit on invisible rows — a deliberate
  // per-word offset, not a shared row baseline. Pure transform (no layout
  // impact, so it can't trigger reflow), capped at JITTER_MAX and paired
  // with a row gap sized at more than 2x that cap — the layout's own box
  // (unaffected by the transform) always keeps rows at least a full gap
  // apart, so even the worst case (one word jittered fully down, the
  // adjacent row's word fully up) can't close the gap to zero.
  const jitterY = useMemo(() => (seededRand(seed, 2) * 2 - 1) * JITTER_MAX, [seed]);

  const animate = inView ? { scale: 1, y: jitterY } : { scale: 0, y: jitterY };

  return (
    <motion.span
      ref={outerRef}
      initial={{ scale: 0, y: jitterY }}
      animate={animate}
      transition={
        reduced
          ? { duration: 0.01 }
          : inView
            ? // Pure pop, staggered per-word: scale snaps from 0 to 1 with
              // an elastic overshoot, each word's `entranceDelay` offsetting
              // when its own pop starts so the cloud fills in random order
              // instead of every phrase popping at once. This has to live
              // in *this* branch, not a pre-`inView` one — `inView` flips
              // true for every word in the same render, so the transition
              // object active in that exact render (this one) is what
              // actually gets used for the scale-0-to-1 change; a delay
              // stashed on a branch that's already stale by the time the
              // change happens never fires.
              { type: "spring", stiffness: 420, damping: 14, mass: 0.5, delay: entranceDelay }
            : { duration: 0.01 }
      }
      // Hidden tiers are hidden on the *outer* box, not the inner text: the
      // flex container's gap would otherwise still be spent on a zero-width
      // wrapper, leaving stray holes in the cloud.
      className={MOBILE_HIDDEN_SIZES.includes(size) ? "hidden sm:inline-block" : "inline-block"}
      style={{ transformOrigin: "center" }}
    >
      <span
        ref={innerRef}
        onFocus={() => onFocusWord(index)}
        onBlur={onBlurWord}
        tabIndex={0}
        className={`inline-block max-w-[88vw] cursor-pointer select-none text-center font-bold tracking-tight sm:max-w-none ${SIZE_CLASS[size]}`}
        style={{
          transformOrigin: "center",
          color: pulsing ? PULSE_COLOR : REST_COLOR,
          fontWeight: 700,
          transform: "scale(1)",
          filter: "none",
          willChange: reduced ? undefined : "transform, filter",
          // Kept short deliberately: during continuous cursor movement a
          // new target arrives roughly every 16ms (one per rAF), so a
          // transition duration much longer than that never actually
          // finishes — it keeps getting redirected mid-flight toward the
          // next target, and the rendered value permanently trails the
          // cursor instead of tracking it. Short enough here that each
          // step effectively completes before the next one lands.
          transition: reduced
            ? undefined
            : "transform 60ms linear, color 80ms ease, font-weight 80ms ease, filter 120ms ease",
        }}
      >
        {text}
      </span>
    </motion.span>
  );
}

export function ProblemCloud() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  // `once: false` — the entrance pop replays every time the section
  // scrolls into view, not just the first time it ever appears on the
  // page.
  const inView = useInView(containerRef, { once: false, amount: 0.15 });
  const [pulseIndex, setPulseIndex] = useState<number | null>(null);
  const pulseIndexRef = useRef<number | null>(null);
  const [fieldActive, setFieldActive] = useState(false);

  const outerEls = useRef<(HTMLSpanElement | null)[]>([]);
  const innerEls = useRef<(HTMLSpanElement | null)[]>([]);
  const centers = useRef<{ x: number; y: number }[]>([]);
  // Rest bounding boxes (page coordinates), for real hit-testing — see
  // `applyField`. Kept separate from `centers` (used for the continuous
  // falloff math) since "is the cursor over this word" needs its actual
  // box, not just proximity to its midpoint.
  const rects = useRef<{ left: number; right: number; top: number; bottom: number }[]>([]);
  const rafId = useRef<number | null>(null);
  const pendingPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    pulseIndexRef.current = pulseIndex;
  }, [pulseIndex]);

  // Rest geometry (page coordinates) of every word's outer box, cached
  // rather than re-measured every frame — a mousemove handler that calls
  // `getBoundingClientRect()` 49 times per frame is a forced-layout tax
  // paid 60 times a second for no reason, when the layout itself is
  // static between hovers. Re-measured on resize (layout genuinely
  // changes) and on entering the cloud (cheap, once per hover session,
  // and covers the case a scroll happened since the last measurement).
  function measureCenters() {
    const nextCenters: { x: number; y: number }[] = [];
    const nextRects: { left: number; right: number; top: number; bottom: number }[] = [];
    outerEls.current.forEach((el) => {
      if (!el) {
        nextCenters.push({ x: 0, y: 0 });
        nextRects.push({ left: 0, right: 0, top: 0, bottom: 0 });
        return;
      }
      const r = el.getBoundingClientRect();
      const left = r.left + window.scrollX;
      const top = r.top + window.scrollY;
      nextCenters.push({ x: left + r.width / 2, y: top + r.height / 2 });
      nextRects.push({ left, right: left + r.width, top, bottom: top + r.height });
    });
    centers.current = nextCenters;
    rects.current = nextRects;
  }

  useEffect(() => {
    if (reduced) return;
    measureCenters();
    window.addEventListener("resize", measureCenters);
    return () => window.removeEventListener("resize", measureCenters);
  }, [reduced, inView]);

  /** The Dock field itself: every word's scale is a continuous function
   * of its own distance from `(px, py)`. The "hit" word — the one that
   * gets the magenta/bold "actively hovered" treatment — is whichever
   * word's actual rest bounding box the cursor is inside, tested
   * directly rather than inferred from proximity to its center: a
   * distance-to-center threshold makes long phrases only register a hit
   * near their middle, so the edges of the very text you're pointing at
   * wouldn't trigger it. Words only grow in place — no positional
   * push/drift — same as real Dock icons, which enlarge where they sit
   * and rely on z-index (below) to visually pop over their still-normal-
   * size neighbours rather than shoving them aside. Everything also gets
   * a depth-of-field blur that grows with distance from the cursor, out
   * to the same fixed `FIELD_RADIUS_PX` the magnification itself uses.
   *
   * Two passes: first the *desired* scale for every word, from the
   * falloff curve alone; then a collision-safety pass that clamps each
   * word's scale so its actual rendered box can never intersect any
   * other word's — this is a hard requirement, not a tuning knob, so it
   * has to be enforced geometrically rather than just picking
   * "hopefully safe" constants. */
  function applyField(px: number, py: number) {
    const pts = centers.current;
    const boxes = rects.current;
    const n = pts.length;
    if (!n) return;

    let hit = -1;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      if (px >= b.left && px <= b.right && py >= b.top && py <= b.bottom) {
        hit = i;
        break;
      }
    }

    // Pass 1 — desired scale per word, purely from distance. Nothing is
    // written to the DOM yet.
    const desired = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      const distance = Math.hypot(pts[i].x - px, pts[i].y - py);
      desired[i] = i === hit ? PEAK_SCALE : 1 + falloff(distance) * (PEAK_SCALE - 1);
    }

    // Pass 2 — clamp each grown word against every other word using
    // whichever axis actually separates them at rest (words in the same
    // row are x-separated; words in different rows are y-separated; the
    // jitter/gap system guarantees at least one holds for every pair).
    // Growth is capped so it only ever consumes *half* of the available
    // gap on that axis — the other half is reserved for the neighbour's
    // own potential growth, so even if both sides of a pair are inside
    // the field simultaneously, neither's allotted half is exceeded and
    // the gap can't be driven negative.
    const scale = desired.slice();
    for (let i = 0; i < n; i++) {
      if (desired[i] <= 1) continue;
      const bi = boxes[i];
      const halfWi = (bi.right - bi.left) / 2;
      const halfHi = (bi.bottom - bi.top) / 2;
      if (halfWi <= 0 || halfHi <= 0) continue;

      let cap = PEAK_SCALE;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const bj = boxes[j];
        const centerDistX = Math.abs(pts[i].x - pts[j].x);
        const centerDistY = Math.abs(pts[i].y - pts[j].y);
        const halfWj = (bj.right - bj.left) / 2;
        const halfHj = (bj.bottom - bj.top) / 2;
        const restSeparatedX = bi.right <= bj.left || bj.right <= bi.left;
        const restSeparatedY = bi.bottom <= bj.top || bj.bottom <= bi.top;

        // Only pairs close enough to plausibly matter — anything far
        // enough away that even both words at PEAK_SCALE couldn't reach
        // each other needs no check at all.
        if (!restSeparatedX && !restSeparatedY) continue; // already touching at rest; shouldn't happen, skip defensively
        if (centerDistX > (halfWi + halfWj) * PEAK_SCALE + COLLISION_MARGIN_PX && restSeparatedX) continue;
        if (centerDistY > (halfHi + halfHj) * PEAK_SCALE + COLLISION_MARGIN_PX && restSeparatedY) continue;

        if (restSeparatedX) {
          const budget = centerDistX - halfWj * desired[j] - COLLISION_MARGIN_PX;
          cap = Math.min(cap, budget / halfWi);
        } else if (restSeparatedY) {
          const budget = centerDistY - halfHj * desired[j] - COLLISION_MARGIN_PX;
          cap = Math.min(cap, budget / halfHi);
        }
      }
      scale[i] = Math.max(1, Math.min(desired[i], cap));
    }

    for (let i = 0; i < n; i++) {
      const el = innerEls.current[i];
      if (!el) continue;
      const isHit = i === hit;
      const s = scale[i];

      const color = isHit ? HOVER_COLOR : pulseIndexRef.current === i ? PULSE_COLOR : REST_COLOR;
      const weight = isHit ? 800 : 700;
      const blur = isHit ? 0 : blurForDistance(distanceToRect(px, py, boxes[i]));

      el.style.transform = `scale(${s})`;
      el.style.color = color;
      el.style.fontWeight = String(weight);
      el.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "";

      // A magnified word visually overlaps its still-normal-size
      // neighbours — that's the actual Dock look, not a bug — but it has
      // to paint *above* them for the overlap to read as "this one is
      // popping forward" rather than "this one is clipped behind that
      // one". z-index has to land on the outer element: that's the
      // actual flex item (the inner span is just a descendant of it), so
      // it's the outer's stacking order that determines paint order
      // among siblings.
      const outerEl = outerEls.current[i];
      if (outerEl) outerEl.style.zIndex = isHit ? "3" : s > 1.02 ? "2" : "";
    }
  }

  function resetField() {
    for (let i = 0; i < innerEls.current.length; i++) {
      const el = innerEls.current[i];
      if (el) {
        el.style.transform = "scale(1)";
        el.style.color = pulseIndexRef.current === i ? PULSE_COLOR : REST_COLOR;
        el.style.fontWeight = "700";
        el.style.filter = "";
      }
      const outerEl = outerEls.current[i];
      if (outerEl) outerEl.style.zIndex = "";
    }
  }

  function scheduleApply(x: number, y: number) {
    pendingPos.current = { x, y };
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (pendingPos.current) applyField(pendingPos.current.x, pendingPos.current.y);
    });
  }

  function handlePointerEnter() {
    if (reduced) return;
    measureCenters();
    setFieldActive(true);
  }

  function handlePointerLeave() {
    if (reduced) return;
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    pendingPos.current = null;
    resetField();
    setFieldActive(false);
  }

  function handleWordFocus(i: number) {
    if (reduced) return;
    measureCenters();
    setFieldActive(true);
    const c = centers.current[i];
    if (c) applyField(c.x, c.y);
  }

  // Paused for as long as the field is active (mouse over the cloud, or
  // a word focused via keyboard) — restarting this effect both stops
  // scheduling further pulses and clears the current one, and picking a
  // fresh index on resume (rather than continuing a stale schedule)
  // keeps it feeling "alive" again immediately once the cursor leaves
  // instead of finishing out whatever gap remained when it paused.
  useEffect(() => {
    if (reduced || !inView || fieldActive) {
      setPulseIndex(null);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      const duration = 1100 + Math.random() * 600;
      timer = setTimeout(() => {
        if (cancelled) return;
        setPulseIndex(pickPulseIndex());
        scheduleNext();
      }, duration);
    }

    setPulseIndex(pickPulseIndex());
    scheduleNext();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reduced, inView, fieldActive]);

  return (
    // `overflow-x: clip` rather than `hidden`: a hovered phrase can still
    // poke past the section's own box, and `hidden` would turn that into a
    // real horizontal page scrollbar. `clip` suppresses it without making
    // this a scroll container (which would also break the page's
    // sticky/pinned behaviour further down).
    <section
      className="relative bg-white py-20 sm:py-24 lg:py-32"
      style={{ overflowX: "clip" }}
      data-nav-scrim="light"
    >
      <div className="mx-auto max-w-[1400px] px-6 text-center sm:px-8 lg:px-12">
        <p className="mb-1.5 font-semibold uppercase tracking-[0.12em] text-ink" style={{ fontSize: "clamp(0.875rem, 0.6rem + 1.2vw, 1.5rem)" }}>
          {problemCloudIntro.eyebrow}
        </p>
        <h2>
          <GiantHeading lines={[problemCloudIntro.heading]} highlight="holding your business" />
        </h2>
      </div>

      <div
        ref={containerRef}
        onMouseEnter={handlePointerEnter}
        onMouseMove={(e) => scheduleApply(e.pageX, e.pageY)}
        onMouseLeave={handlePointerLeave}
        className="mx-auto mt-8 flex max-w-[1500px] flex-wrap items-center justify-center gap-x-5 gap-y-5 px-5 sm:mt-10 sm:gap-x-7 sm:gap-y-7 lg:mt-14 lg:gap-x-10 lg:gap-y-9 lg:px-14"
      >
        {problemWords.map((word, i) => (
          <Word
            key={word.text}
            text={word.text}
            size={word.size}
            index={i}
            inView={inView}
            reduced={reduced}
            pulsing={pulseIndex === i}
            outerRef={(el) => {
              outerEls.current[i] = el;
            }}
            innerRef={(el) => {
              innerEls.current[i] = el;
            }}
            onFocusWord={handleWordFocus}
            onBlurWord={handlePointerLeave}
          />
        ))}
      </div>
    </section>
  );
}
