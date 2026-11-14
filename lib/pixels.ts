/**
 * Pixel-block helpers for the homepage's canvas moments — the hero
 * mockup assembling out of brand blocks and the closing pixel M — plus
 * the shared reduced-motion check and easing used across the page.
 *
 * Canvas only, painted at device-pixel-ratio 1: the blocks are meant to be
 * crisp squares, and a 1x backing store keeps a full-section overlay cheap.
 */

export const BRAND_BLUE = "#2C4BFF";
export const BRAND_MAGENTA = "#FF2E93";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Strong deceleration — blocks arrive fast and settle softly. */
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** Deterministic PRNG so a section's dissolve order is stable per run. */
export function rng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sizes a canvas's backing store to its CSS box (1x) and returns it. */
export function fitCanvas(canvas: HTMLCanvasElement) {
  const w = Math.max(1, Math.round(canvas.clientWidth));
  const h = Math.max(1, Math.round(canvas.clientHeight));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  return { w, h, ctx: canvas.getContext("2d")! };
}

/**
 * The Matterpixel M as a block grid: rasterises the two wedges of the mark
 * (public/mark.svg, viewBox 300×200) at `cols` × `cols*2/3` cells and
 * returns each filled cell with its brand colour.
 */
export function markCells(cols: number) {
  const rows = Math.round((cols * 2) / 3);
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext("2d")!;
  ctx.scale(cols / 300, rows / 200);
  ctx.fillStyle = "#0000ff";
  ctx.fill(new Path2D("M12 0h47l86 100-86 100H12A12 12 0 0 1 0 188V12A12 12 0 0 1 12 0Z"));
  ctx.fillStyle = "#ff0000";
  ctx.fill(new Path2D("M288 0h-47l-86 100 86 100h47a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12Z"));
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const cells: { c: number; r: number; color: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4;
      if (data[i + 3] < 128) continue;
      cells.push({ c, r, color: data[i + 2] > data[i] ? BRAND_BLUE : BRAND_MAGENTA });
    }
  }
  return { cells, cols, rows };
}
