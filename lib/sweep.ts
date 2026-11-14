/* ── Directional sweep ──────────────────────────────────────────────────
   The homepage's switch transition (package picker, concept showcase).
   Moving forward sweeps the new view in from the right; back, from the
   left. `out` and `into` share one grid cell; `edge` is a `.sweep-edge`
   element inside the same box. One eased timeline drives four layers:
     1. the incoming package is unmasked behind a moving edge (clip-path)
     2. a light edge — a blue→magenta line with a soft trailing glow —
        rides that boundary, so the reveal reads as a scan
     3. the outgoing package drifts the other way, dimming and blurring
     4. every element of the incoming package (`data-m`) slides in from
        the sweep's direction at the moment the edge passes over it, so
        the content arrives in depth rather than as one flat wipe
   Transform, opacity, filter and clip-path only, on the Web Animations
   API; nothing is laid out mid-sweep. */
export const SWEEP_MS = 760;
const SWEEP_EASE = "cubic-bezier(0.77, 0, 0.175, 1)";
const ITEM_MS = 560;
const ITEM_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Width of the light edge's trailing glow, px. */
const EDGE_W = 160;

const marks = (panel: HTMLElement) => [...panel.querySelectorAll<HTMLElement>("[data-m]")];

/** Inverse of the sweep's ease, sampled — the time (0–1) at which the
 * edge reaches a given fraction of the card. */
function edgeTime(fraction: number) {
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < fraction) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * `axis` "x" (default) sweeps side to side — forward comes in from the
 * right. "y" sweeps vertically, for lists that run top to bottom — forward
 * (down the list) comes in from the bottom, back from the top.
 */
export function sweep(
  out: HTMLElement,
  into: HTMLElement,
  edge: HTMLElement,
  dir: 1 | -1,
  axis: "x" | "y" = "x",
): Animation[] {
  const card = into.getBoundingClientRect();
  const vertical = axis === "y";
  const size = vertical ? card.height : card.width;
  const T = vertical ? "translateY" : "translateX";
  const anims: Animation[] = [];

  // 1. Unmask the incoming view from the side we're moving toward.
  const from = vertical
    ? dir > 0
      ? "inset(100% 0 0 0)"
      : "inset(0 0 100% 0)"
    : dir > 0
      ? "inset(0 0 0 100%)"
      : "inset(0 100% 0 0)";
  anims.push(
    into.animate([{ clipPath: from }, { clipPath: "inset(0 0 0 0)" }], {
      duration: SWEEP_MS,
      easing: SWEEP_EASE,
      fill: "both",
    }),
  );

  // 2. The light edge rides the boundary. The line sits on the edge's
  // leading side; its glow trails over the newly revealed content. Forward,
  // the boundary runs size→0 (line on the element's near side); back, 0→size
  // (line on its far side, so offset by the glow width).
  edge.hidden = false;
  edge.dataset.dir = vertical ? (dir > 0 ? "up" : "down") : dir > 0 ? "left" : "right";
  const start = dir > 0 ? size : -EDGE_W;
  const end = dir > 0 ? 0 : size - EDGE_W;
  anims.push(
    edge.animate(
      [
        { transform: `${T}(${start}px)`, opacity: 0 },
        { opacity: 1, offset: 0.08 },
        { opacity: 1, offset: 0.86 },
        { transform: `${T}(${end}px)`, opacity: 0 },
      ],
      { duration: SWEEP_MS, easing: SWEEP_EASE, fill: "both" },
    ),
  );

  // 3. The outgoing view recedes the other way.
  anims.push(
    out.animate(
      [
        { transform: `${T}(0)`, opacity: 1, filter: "blur(0px)" },
        { transform: `${T}(${-dir * 56}px)`, opacity: 0.15, filter: "blur(6px)" },
      ],
      { duration: SWEEP_MS, easing: SWEEP_EASE, fill: "both" },
    ),
  );

  // 4. Each incoming element lands as the edge reaches it.
  for (const el of marks(into)) {
    const r = el.getBoundingClientRect();
    const lead = vertical
      ? dir > 0
        ? (card.bottom - r.bottom) / size
        : (r.top - card.top) / size
      : dir > 0
        ? (card.right - r.right) / size
        : (r.left - card.left) / size;
    const delay = edgeTime(Math.min(1, Math.max(0, lead))) * SWEEP_MS * 0.9;
    anims.push(
      el.animate(
        [
          { transform: `${T}(${dir * 44}px)`, opacity: 0, filter: "blur(3px)" },
          { transform: `${T}(0)`, opacity: 1, filter: "blur(0px)" },
        ],
        { duration: ITEM_MS, delay, easing: ITEM_EASE, fill: "both" },
      ),
    );
  }
  return anims;
}
