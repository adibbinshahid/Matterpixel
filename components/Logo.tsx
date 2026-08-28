"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Master logo lockup (public/logo.png) — mark + "matterpixel" wordmark
 * with the brand's infinity-crossing "x". Use this everywhere the full
 * lockup is required (nav, footer, mobile menu); use <MarkImg> alone
 * for icon-only spots (hero visual, playground fallback).
 *
 * The raster wordmark (baked dark-gray ink) is illegible over a dark
 * background — `forceLight` swaps it for public/logo-dark.png, which is the
 * same lockup with only the near-gray wordmark pixels remapped to a light
 * tone and the brand-color icon blocks left untouched. Both files are built
 * from the delivered brand art in brand/, not recolored in the browser.
 *
 * `variant="wordmark"` drops the mark and renders the text-only lockup —
 * for spots that already carry the mark next to it.
 */
const VARIANTS = {
  lockup: { light: "/logo.png", dark: "/logo-dark.png", width: 1824, height: 514 },
  wordmark: { light: "/wordmark.png", dark: "/wordmark-dark.png", width: 1888, height: 607 },
} as const;

export function Logo({
  className,
  imgClassName = "h-8 w-auto",
  imgId,
  priority = false,
  forceLight = false,
  variant = "lockup",
  sizes = "256px",
}: {
  className?: string;
  imgClassName?: string;
  imgId?: string;
  priority?: boolean;
  /** Use the light-wordmark variant — for spots (like the transparent-
   * over-hero nav) that sit on a dark background. */
  forceLight?: boolean;
  /** "lockup" = mark + wordmark; "wordmark" = the text alone. */
  variant?: keyof typeof VARIANTS;
  /** CSS width the lockup actually renders at, so Next picks a matching
   * srcset candidate. Without it, the intrinsic `width` below makes Next
   * assume the image can fill the viewport and generate a 3840px variant —
   * for a lockup that is never wider than ~280px on screen. The nav's copy
   * is `priority`, so that oversized file was also being preloaded at high
   * priority in <head>, competing with the hero for bandwidth. */
  sizes?: string;
}) {
  const art = VARIANTS[variant];

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        id={imgId}
        src={forceLight ? art.dark : art.light}
        alt="Matterpixel"
        width={art.width}
        height={art.height}
        sizes={sizes}
        priority={priority}
        // Both files carry 8.11% transparent clear space on each side, so
        // the visible lockup sits inset from the image's actual edge —
        // shift it left to align flush with surrounding text.
        className={cn("-translate-x-[8.11%]", imgClassName)}
      />
    </span>
  );
}
