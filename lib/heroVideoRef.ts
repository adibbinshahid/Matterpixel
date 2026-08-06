/**
 * Module-level singleton so a component outside Hero (Stats' top-seam
 * bleed) can mirror its actual playing frame in real time via canvas,
 * instead of running a second independent <video> loop of the same clip
 * — two autoplay loops of one source drift out of sync within moments
 * (each starts its own loop at a different point and free-runs from
 * there), which on this footage's colorful light streaks reads as an
 * obviously separate, mismatched video rather than a fade of the real
 * one. Mirroring the live element guarantees pixel-identical frames.
 */
let activeHeroVideo: HTMLVideoElement | null = null;

export function setHeroVideo(el: HTMLVideoElement | null) {
  activeHeroVideo = el;
}

export function getHeroVideo(): HTMLVideoElement | null {
  return activeHeroVideo;
}
