"use client";

import { useEffect, useState } from "react";

const CACHE_KEY = "mp-logo-dark-src";
let inflight: Promise<string> | null = null;

/**
 * logo.png's icon blocks are saturated brand blue/magenta (fine on dark),
 * but the "matterpixel" wordmark is solid dark-gray ink — invisible on a
 * dark background. There's no vector source to hand-author a dark variant,
 * and a global CSS invert() would also flip the brand-color blocks. So this
 * remaps only the near-gray, low-saturation pixels (the wordmark) to a
 * light tone via a one-time canvas pass, leaving the colored blocks
 * untouched byte-for-byte.
 */
function recolor(): Promise<string> {
  if (inflight) return inflight;
  inflight = new Promise((resolve, reject) => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        resolve(cached);
        return;
      }
    } catch {
      // localStorage unavailable — fall through and recompute in-memory.
    }

    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("2d context unavailable");
        ctx.drawImage(img, 0, 0);

        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = frame.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i];
          const g = px[i + 1];
          const b = px[i + 2];
          const a = px[i + 3];
          if (a === 0) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          if (saturation < 0.15 && max < 140) {
            // Near-gray + dark → wordmark ink. Swap to the dark-theme --ink.
            px[i] = 245;
            px[i + 1] = 243;
            px[i + 2] = 238;
          }
        }
        ctx.putImageData(frame, 0, 0);

        const url = canvas.toDataURL("image/png");
        try {
          localStorage.setItem(CACHE_KEY, url);
        } catch {
          // Data URL too large for localStorage on this browser — fine,
          // the in-memory `inflight` promise still serves this tab session.
        }
        resolve(url);
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };
    img.onerror = () => reject(new Error("failed to load /logo.png"));
    img.src = "/logo.png";
  });
  return inflight;
}

/**
 * Returns the recolored data URL once ready, or null until then.
 *
 * Precomputes unconditionally on mount (idle time, not gated on whether
 * dark mode is active yet) — the pixel loop + PNG encode below is a
 * multi-megapixel synchronous main-thread operation, expensive enough that
 * running it for the first time at the exact moment dark mode activates
 * caused a dropped frame right in the middle of the light↔dark wipe
 * transition. Doing it early and idle means it's already cached (in-memory
 * + localStorage) by the time it's actually needed.
 */
export function useDarkLogoSrc(): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (src) return;
    let cancelled = false;

    const run = () => {
      recolor()
        .then((url) => {
          if (!cancelled) setSrc(url);
        })
        .catch(() => {
          // Swallow — Logo falls back to the light asset, which is still
          // legible enough (blue/magenta blocks read fine either way).
        });
    };

    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle
      ? window.requestIdleCallback(run, { timeout: 2000 })
      : window.setTimeout(run, 1200);

    return () => {
      cancelled = true;
      if (hasIdle) {
        window.cancelIdleCallback(handle as number);
      } else {
        window.clearTimeout(handle as number);
      }
    };
  }, [src]);

  return src;
}
