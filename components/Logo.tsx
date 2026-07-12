import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Master logo lockup (public/logo.png) — mark + "matterpixel" wordmark
 * with the brand's infinity-crossing "x". Use this everywhere the full
 * lockup is required (nav, footer, mobile menu); use <MarkImg> alone
 * for icon-only spots (hero visual, playground fallback).
 */
export function Logo({
  className,
  imgClassName = "h-8 w-auto",
  priority = false,
}: {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="Matterpixel"
        width={4920}
        height={1256}
        priority={priority}
        // The source PNG has ~7.36% transparent padding baked in on both
        // sides, so the visible mark sits inset from the image's actual
        // edge — shift it left to align flush with surrounding text.
        className={cn("-translate-x-[7.36%]", imgClassName)}
      />
    </span>
  );
}
