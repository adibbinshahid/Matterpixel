"use client";

import { useEffect, type RefObject } from "react";
import { prefersReducedMotion } from "@/lib/pixels";

/**
 * The homepage's entrance choreography. Any element inside `root` tagged
 * `data-reveal` is staged when the page loads and plays when it actually
 * reaches the screen; elements arriving together run in reading order on
 * a short stagger.
 *
 *   seam    a blue→magenta light draws across the section's top border,
 *           then fades back to the hairline
 *   eyebrow lifts in
 *   title   rises out of a mask from below
 *   lede    lifts in, blur to sharp
 *   block   cards, grids, panels: rise 40px from soft, slightly small and
 *           transparent to settled
 *
 * Content is never hidden by default: staging happens in script, only for
 * elements still below the fold, so a failed script or a deep link shows
 * the page as-is. Each animation is cancelled when it finishes, leaving no
 * inline styles behind. Reduced motion: a plain 400ms fade.
 *
 * Phones (<768px) get one short recipe for every kind: a 12px lift over
 * 300ms with no stagger and no blur or clip. A flick covers a screen in a
 * fraction of a second, and a long staged entrance there reads as blank
 * sections rather than motion.
 */

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const STAGGER_MS = 90;
const MAX_STEPS = 6;

const FRAMES: Record<string, { frames: Keyframe[]; duration: number; easing?: string }> = {
  seam: {
    frames: [
      { transform: "scaleX(0)", opacity: 1 },
      { transform: "scaleX(1)", opacity: 1, offset: 0.55 },
      { transform: "scaleX(1)", opacity: 0 },
    ],
    duration: 1400,
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
  eyebrow: {
    frames: [
      { opacity: 0, transform: "translateY(10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    duration: 700,
  },
  title: {
    frames: [
      { clipPath: "inset(0 -4% 100% -4%)", transform: "translateY(0.45em)" },
      { clipPath: "inset(0 -4% -20% -4%)", transform: "translateY(0)" },
    ],
    duration: 1050,
  },
  lede: {
    frames: [
      { opacity: 0, transform: "translateY(16px)", filter: "blur(6px)" },
      { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
    ],
    duration: 900,
  },
  block: {
    frames: [
      { opacity: 0, transform: "translateY(40px) scale(0.985)", filter: "blur(8px)" },
      { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
    ],
    duration: 1000,
  },
};

const FADE: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];

const MOBILE: { frames: Keyframe[]; duration: number; easing?: string } = {
  frames: [
    { opacity: 0, transform: "translateY(12px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  duration: 300,
};

export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = prefersReducedMotion();
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const fold = window.innerHeight * 0.92;
    const targets = [...root.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
      (el) => el.getBoundingClientRect().top > fold,
    );
    if (!targets.length) return;

    // Stage: each element's first frame applies now, paused.
    const staged = new Map<Element, Animation>();
    for (const el of targets) {
      const spec = phone ? MOBILE : (FRAMES[el.dataset.reveal ?? "block"] ?? FRAMES.block);
      const anim = el.animate(reduced ? FADE : spec.frames, {
        duration: reduced ? (phone ? 300 : 400) : spec.duration,
        easing: reduced ? "ease-out" : (spec.easing ?? EASE),
        fill: "both",
      });
      anim.pause();
      staged.set(el, anim);
    }

    const io = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        arriving.forEach((el, i) => {
          io.unobserve(el);
          const anim = staged.get(el);
          if (!anim) return;
          anim.effect?.updateTiming({ delay: reduced || phone ? 0 : Math.min(i, MAX_STEPS) * STAGGER_MS });
          anim.play();
          anim.finished.then(() => anim.cancel()).catch(() => undefined);
        });
      },
      // Phones play on the first pixel in view: a held -10% band could
      // leave a heading invisible at the foot of the screen if the scroll
      // stops with it there.
      { rootMargin: phone ? "0px" : "0px 0px -10% 0px" },
    );
    targets.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      staged.forEach((a) => a.cancel());
    };
  }, [rootRef]);
}
