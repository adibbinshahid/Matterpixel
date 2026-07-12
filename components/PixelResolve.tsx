"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn, EASE } from "@/lib/utils";

type Trigger = "view" | "hover" | "both";

/**
 * The site's signature move: content starts pixelated/blurred behind a
 * brand-colored pixel-mosaic overlay, then resolves to crisp on
 * scroll-into-view and/or hover. Pure CSS filter + background-position,
 * no per-frame JS — cheap enough for hero, every work card, and case
 * study headers.
 */
export function PixelResolve({
  children,
  className,
  trigger = "view",
  delay = 0,
  cell = 20,
}: {
  children: ReactNode;
  className?: string;
  trigger?: Trigger;
  delay?: number;
  cell?: number;
}) {
  const [resolved, setResolved] = useState(false);
  const hoverEnabled = trigger === "hover" || trigger === "both";
  const viewEnabled = trigger === "view" || trigger === "both";

  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => hoverEnabled && setResolved(true)}
      onMouseLeave={() => trigger === "hover" && setResolved(false)}
      onViewportEnter={() => viewEnabled && setResolved(true)}
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          filter: resolved
            ? "blur(0px) saturate(1)"
            : "blur(18px) saturate(0.55)",
        }}
        transition={{ duration: 0.6, ease: EASE, delay }}
      >
        {children}
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(45deg, var(--blue) 25%, transparent 25%, transparent 75%, var(--blue) 75%), linear-gradient(45deg, var(--magenta) 25%, transparent 25%, transparent 75%, var(--magenta) 75%)",
          backgroundSize: `${cell}px ${cell}px`,
          backgroundPosition: `0 0, ${cell / 2}px ${cell / 2}px`,
        }}
        initial={{ opacity: 0.9, scale: 1 }}
        animate={{ opacity: resolved ? 0 : 0.9, scale: resolved ? 1.25 : 1 }}
        transition={{ duration: 0.6, ease: EASE, delay }}
      />
    </motion.div>
  );
}
