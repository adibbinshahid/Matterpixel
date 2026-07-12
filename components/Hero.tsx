"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { NetworkBackground } from "@/components/NetworkBackground";
import { TechMarquee } from "@/components/TechMarquee";
import { FeatureStrip } from "@/components/FeatureStrip";
import { hero } from "@/content/siteConfig";
import { EASE } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-paper pt-24"
    >
      <NetworkBackground className="absolute inset-0 -z-10 overflow-hidden" />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center sm:px-8">
        <div className="w-full -translate-y-5">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mb-5 whitespace-nowrap text-[clamp(0.8rem,2.2vw,1.25rem)] font-bold uppercase tracking-[0.06em] text-blue"
          >
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink"
          >
            we <span className="text-blue">build</span> what matters.
            <br />
            down to the <span className="text-magenta">pixel</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
            className="mt-6 max-w-xl whitespace-normal text-base leading-relaxed text-ink-soft sm:max-w-none sm:whitespace-nowrap sm:text-[clamp(0.7rem,1.9vw,1.25rem)]"
          >
            {hero.sub}
          </motion.p>
        </div>

        <div className="mt-12 w-full">
          <FeatureStrip />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6"
        >
          <Link
            href="/contact#email"
            className="font-avenir group inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-[1.26rem] py-[0.72rem] text-[0.7875rem] text-paper transition-transform duration-300 hover:scale-105 animate-gradient-shift sm:px-[2.1rem] sm:py-[1.2rem] sm:text-[1.05rem]"
          >
            {hero.ctaPrimary}
            <ArrowUpRight className="h-[0.9rem] w-[0.9rem] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-[1.2rem] sm:w-[1.2rem]" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
          className="mt-10 w-full max-w-3xl"
        >
          <TechMarquee />
        </motion.div>
      </div>
    </section>
  );
}
