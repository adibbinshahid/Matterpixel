"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Full-bleed auto-scrolling filmstrip beneath the hero CTA. Every card is
 * an image placeholder — random picsum.photos stand-ins for now, real
 * photos/screenshots drop in later.
 *
 * Motion, not CSS keyframes/setInterval: a single `x` motion value drives
 * the whole track. A hand-rolled rAF loop moves it from 0 to -setWidth (one
 * full "set" of cards, which is duplicated in the DOM so wrapping is
 * seamless) and repeats — pausing on hover and handing off to `drag="x"`
 * mid-scroll both just stop/restart that same loop from wherever `x`
 * currently is.
 */

const GAP = 20; // px — keep in sync with the track's gap-5 below
const PADDING = 24; // px — keep in sync with the track's px-6 below
// Distance (px) over which a card ramps from dead-center to full
// edge-of-frame styling — shared by scale/lift/tilt/brightness so they
// all stay in lockstep.
const FALLOFF = 480;
// Average scroll speed, not a fixed total-loop-time — so growing the
// image pool makes the repeat cycle longer, not the scroll faster.
const SPEED_PX_PER_SEC = 68;
// How much the instantaneous speed dips as a card passes dead-center
// (0 = constant speed, 1 = full stop at center). Keeps the loop
// continuous/seamless — just dwells near center instead of blowing
// through it at a constant clip — so there's always a card reading as
// the front-facing one, not just a flicker mid-scroll.
const CENTER_EASE = 0.75;

function PlaceholderTall({ seed }: { seed: string }) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={`https://picsum.photos/seed/${seed}/400/600`}
        alt=""
        fill
        draggable={false}
        sizes="(min-width: 768px) 224px, (min-width: 640px) 192px, 160px"
        className="pointer-events-none object-cover select-none"
      />
    </div>
  );
}

// A wide pool of distinct placeholder photos — enough that the repeating
// cycle isn't something a viewer notices within a normal viewing window.
// Swap for real project imagery later; the length/order don't matter then.
function buildCards(): { key: string; content: ReactNode }[] {
  const seeds = [
    "scentora",
    "website-preview",
    "mindwell",
    "ai-photography",
    "automation-flow",
    "lcinco",
    "analytics",
    "video-gen",
    "insightflow",
    "design-system",
    "placeholder-11",
    "placeholder-12",
    "placeholder-13",
    "placeholder-14",
    "placeholder-15",
    "placeholder-16",
    "placeholder-17",
    "placeholder-18",
    "placeholder-19",
    "placeholder-20",
    "placeholder-21",
    "placeholder-22",
    "placeholder-23",
    "placeholder-24",
  ];
  return seeds.map((seed) => ({ key: seed, content: <PlaceholderTall seed={seed} /> }));
}

type Metrics = { cardWidth: number; containerWidth: number };

/**
 * Takes the metrics as a ref, not a prop derived from state — reading
 * `metricsRef.current` fresh inside the transform callback means a resize
 * never has to flow through React state/re-renders to stay accurate. That
 * matters here specifically because state churn was the original bug: an
 * object identity change on every ResizeObserver firing was tripping an
 * effect that restarted the scroll loop from wherever it currently was,
 * so it kept getting cut off a fraction of a second in and never actually
 * progressed (see HeroFilmstrip's measurement effect below).
 */
function FilmCard({
  trackX,
  index,
  metricsRef,
  children,
}: {
  trackX: MotionValue<number>;
  index: number;
  metricsRef: RefObject<Metrics | null>;
  children: ReactNode;
}) {
  const signedDistance = useTransform(trackX, (tx) => {
    const m = metricsRef.current;
    if (!m) return 0;
    const cardCenter = index * (m.cardWidth + GAP) + m.cardWidth / 2;
    return cardCenter + tx - m.containerWidth / 2;
  });
  const distance = useTransform(signedDistance, (d) => Math.abs(d));
  // One shared falloff distance for scale/lift/tilt/brightness, so they
  // all agree on which card reads as centered instead of drifting out of
  // sync (previously scale/lift maxed out at 340px while tilt kept
  // changing out to 720px — the two cues disagreed past that point).
  const scale = useTransform(distance, [0, FALLOFF], [1.12, 0.86], { clamp: true });
  const y = useTransform(distance, [0, FALLOFF], [-18, 12], { clamp: true });
  // Cover-flow tilt: front-facing at center, angled outward toward the
  // edges — sign flips either side of center so left/right cards face in.
  const rotateY = useTransform(signedDistance, [-FALLOFF, 0, FALLOFF], [45, 0, -45], { clamp: true });
  // Dims off-center cards independent of rotation — rotateY alone barely
  // reads on flat/low-contrast photos (e.g. plain sky), which made the
  // centered card ambiguous. Brightness is a content-agnostic tell.
  const brightness = useTransform(distance, [0, FALLOFF], [1, 0.6], { clamp: true });
  const filter = useTransform(brightness, (b) => `brightness(${b})`);

  return (
    <motion.div
      className="w-40 shrink-0 overflow-hidden rounded-2xl border shadow-[0_20px_45px_-18px_rgba(22,22,28,0.35)] sm:w-48 md:w-56"
      style={{
        aspectRatio: "3 / 4",
        scale,
        y,
        rotateY,
        filter,
        transformPerspective: 1200,
        background: "var(--glass-bg)",
        borderColor: "var(--glass-border)",
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroFilmstrip() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rafRef = useRef(0);
  const metricsRef = useRef<Metrics | null>(null);
  const loopStartedRef = useRef(false);
  const [repeatCount, setRepeatCount] = useState(3);

  const cards = buildCards();

  function stopLoop() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
  }

  // Hand-rolled rAF loop driving `x.set()` directly, rather than Motion's
  // animate() — same proven pattern already used elsewhere in this
  // codebase (IntroExperience, LivingMark).
  function startLoop() {
    stopLoop();
    const m = metricsRef.current;
    if (reduced || !m) return;
    const pitch = m.cardWidth + GAP;
    const setWidth = cards.length * pitch;
    // tx at which card 0 sits dead-center — the phase reference every
    // other alignment (every `pitch` beyond it) repeats from.
    const centeredTx = m.containerWidth / 2 - m.cardWidth / 2 - PADDING;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const traveled = centeredTx - x.get();
      const progress = (((traveled % pitch) + pitch) % pitch) / pitch; // 0 at center, wraps every card
      const speed = SPEED_PX_PER_SEC * (1 - CENTER_EASE * Math.cos(progress * Math.PI * 2));
      let next = x.get() - speed * dt;
      if (next <= -setWidth) next += setWidth; // seamless — content is duplicated
      x.set(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    const container = containerRef.current;
    const firstCard = trackRef.current?.firstElementChild as HTMLElement | null;
    if (!container || !firstCard) return;

    const update = () => {
      const cardWidth = firstCard.getBoundingClientRect().width;
      const containerWidth = container.clientWidth;
      metricsRef.current = { cardWidth, containerWidth };

      // Enough duplicated copies of the card set to cover the widest
      // viewport plus a buffer, so the wrap point never runs out of
      // rendered cards ahead of the visible window (the actual jump this
      // was fixing on ultra-wide screens with only 2 copies).
      const setWidth = cards.length * (cardWidth + GAP);
      const needed = Math.max(3, Math.ceil(containerWidth / setWidth) + 2);
      setRepeatCount((prev) => (prev === needed ? prev : needed));

      // Kick off the loop once, on the first real measurement — later
      // resize events just refresh metricsRef for FilmCard's live
      // distance-from-center math; they must NOT restart the loop.
      if (!loopStartedRef.current && !reduced) {
        loopStartedRef.current = true;
        startLoop();
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(firstCard);
    return () => {
      ro.disconnect();
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
      aria-hidden="true"
    >
      <motion.div
        ref={trackRef}
        className="flex w-max cursor-grab items-center gap-5 px-6 active:cursor-grabbing"
        style={{ x, transformStyle: "preserve-3d" }}
        drag="x"
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={stopLoop}
        onDragEnd={startLoop}
      >
        {Array.from({ length: repeatCount }).flatMap((_, s) =>
          cards.map((card, i) => (
            <FilmCard key={`${card.key}-${s}`} trackX={x} index={s * cards.length + i} metricsRef={metricsRef}>
              {card.content}
            </FilmCard>
          )),
        )}
      </motion.div>
    </div>
  );
}
