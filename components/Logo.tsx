"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useDarkLogoSrc } from "@/lib/useDarkLogoSrc";

/**
 * Master logo lockup (public/logo.png) — mark + "matterpixel" wordmark
 * with the brand's infinity-crossing "x". Use this everywhere the full
 * lockup is required (nav, footer, mobile menu); use <MarkImg> alone
 * for icon-only spots (hero visual, playground fallback).
 *
 * The raster wordmark (baked dark-gray ink) is illegible over a dark
 * background — `forceLight` swaps it for a client-recolored variant (see
 * lib/useDarkLogoSrc.ts) without touching the brand-color icon blocks.
 */
export function Logo({
  className,
  imgClassName = "h-8 w-auto",
  imgId,
  priority = false,
  forceLight = false,
}: {
  className?: string;
  imgClassName?: string;
  imgId?: string;
  priority?: boolean;
  /** Use the light-wordmark variant — for spots (like the transparent-
   * over-hero nav) that sit on a dark background. */
  forceLight?: boolean;
}) {
  // Precomputed eagerly/idly on mount regardless of `forceLight` — see
  // lib/useDarkLogoSrc.ts for why (it must not start its expensive canvas
  // work for the first time exactly when it's actually needed).
  const darkSrc = useDarkLogoSrc();
  const src = forceLight && darkSrc ? darkSrc : "/logo.png";

  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        id={imgId}
        src={src}
        alt="Matterpixel"
        width={4920}
        height={1256}
        priority={priority}
        unoptimized={src.startsWith("data:")}
        // The source PNG has ~7.36% transparent padding baked in on both
        // sides, so the visible mark sits inset from the image's actual
        // edge — shift it left to align flush with surrounding text.
        className={cn("-translate-x-[7.36%]", imgClassName)}
      />
    </span>
  );
}
