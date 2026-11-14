"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";
import { Aurora } from "@/components/home/Aurora";
import { cn } from "@/lib/utils";

/**
 * A homepage section with the shared entrance choreography (lib/useReveal):
 * its `data-reveal` children are staged below the fold and play as they
 * arrive. `seam` adds the light that draws across the section's top
 * border on arrival — use it on sections that carry a `border-t`.
 */
export function PixelSection({
  children,
  className,
  tone = "dark",
  seam = false,
  id,
  label,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light" | "blue" | "magenta";
  seam?: boolean;
  id?: string;
  label?: string;
  labelledBy?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={label}
      aria-labelledby={labelledBy}
      data-nav-scrim={tone === "light" ? undefined : "light"}
      className={cn(
        "relative",
        tone === "light" && "home-light isolate overflow-hidden",
        tone === "blue" && "home-blue",
        tone === "magenta" && "home-magenta",
        className,
      )}
    >
      {tone === "light" && <Aurora />}
      {seam && <span aria-hidden="true" data-reveal="seam" className="reveal-seam" />}
      {children}
    </section>
  );
}
