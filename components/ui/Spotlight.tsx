"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A surface that is lit by the cursor rather than one that reacts to it.
 *
 * Two layers sit over the plate, both anchored to `--mx`/`--my` (pointer
 * position in the element's own coordinates, written on pointermove):
 *
 *  - the rim: a 1px ring, drawn by the border-box/content-box mask trick,
 *    carrying a magenta radial. Only the arc nearest the pointer is lit,
 *    so the edge appears to catch light as the cursor travels — there is
 *    no resting outline anywhere.
 *  - the wash: a wide, low-alpha white radial that reads as sheen on the
 *    plate under the pointer.
 *
 * Nothing scales, sweeps, or bounces. The only motion is the light, which
 * tracks the pointer exactly (so it can never feel laggy or over-eased),
 * and the 700ms fade that brings both layers up and down. Position writes
 * are rAF-coalesced, so a fast traverse costs one style write per frame.
 */
export function Spotlight({
  href,
  external = false,
  className,
  children,
  ariaLabel,
  /** Diameter of the lit arc on the rim. */
  rim = 180,
  /** Diameter of the sheen on the plate. */
  wash = 260,
}: {
  href: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  rim?: number;
  wash?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const queued = useRef(0);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || queued.current) return;
    const { clientX, clientY } = e;
    queued.current = requestAnimationFrame(() => {
      queued.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - r.left}px`);
      el.style.setProperty("--my", `${clientY - r.top}px`);
    });
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onPointerMove={onPointerMove}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        // The plate itself: top-lit gradient plus a 1px inset specular
        // hairline. That hairline is the whole resting edge — no border.
        "group relative isolate overflow-hidden rounded-xl bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.022))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.4)]",
        // Inset only — the plate never casts an outer glow. A drop shadow
        // here read as a halo that hung around after the pointer left.
        "transition-shadow duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_1px_2px_rgba(0,0,0,0.4)]",
        "focus-visible:outline-none",
        className,
      )}
    >
      {/* Rim — lit only where the pointer is. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          padding: 1,
          background: `radial-gradient(${rim}px circle at var(--mx, 50%) var(--my, 50%), rgba(255,46,147,0.85), rgba(255,255,255,0.10) 45%, transparent 72%)`,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      {/* Wash — sheen on the plate under the pointer. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
        style={{
          background: `radial-gradient(${wash}px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.075), rgba(255,46,147,0.05) 45%, transparent 65%)`,
        }}
      />
      {children}
    </a>
  );
}
