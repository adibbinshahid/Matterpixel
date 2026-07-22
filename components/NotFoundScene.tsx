"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { EASE } from "@/lib/utils";

const PIXELS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const radius = 70 + (i % 3) * 30;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    color: i % 2 === 0 ? "var(--blue)" : "var(--magenta)",
    size: 8 + (i % 3) * 5,
    delay: (i % 6) * 0.08,
  };
});

export function NotFoundScene() {
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center gap-10 px-6 pt-24 text-center">
      <div className="relative flex h-52 w-52 shrink-0 items-center justify-center sm:h-64 sm:w-64">
        {PIXELS.map((p, i) => (
          <motion.span
            key={i}
            className="absolute"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: p.delay, ease: EASE }}
          />
        ))}
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          className="relative text-6xl font-extrabold tracking-tight text-ink sm:text-7xl"
        >
          404
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
        className="flex flex-col items-center gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            This pixel doesn&rsquo;t exist. <span className="text-magenta">Yet.</span>
          </h1>
          <p className="mt-3 max-w-sm text-ink-soft">
            The page you&rsquo;re looking for got lost between the grid lines.
          </p>
        </div>
        <Link
          href="/"
          className="hover-lift font-avenir group inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-6 py-3.5 text-sm text-paper animate-gradient-shift"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back home
        </Link>
      </motion.div>
    </section>
  );
}
