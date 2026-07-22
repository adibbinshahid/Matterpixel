"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { DURATIONS, EASE } from "@/lib/utils";

/**
 * Site-wide scroll reveal: staggered fade + upward translate + blur-to-sharp.
 * Wraps `whileInView` so every section gets the same reveal language.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = DURATIONS.standard,
  y = 24,
  as = "div",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Override the reveal duration — e.g. DURATIONS.quick for a fast-
   * checkpoint section (Trust). Defaults to the standard content-reveal
   * tier every other section already uses. */
  duration?: number;
  y?: number;
  as?: "div" | "span";
  once?: boolean;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, delay, ease: EASE },
    },
  };

  const MotionTag = as === "span" ? motion.span : motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.3 }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/** Stagger container — pairs with <Reveal> children or RevealItem for lists. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  y = 24,
  duration = DURATIONS.standard,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration, ease: EASE },
    },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
