"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { services, type Service } from "@/content/services";
import { servicesIntro, servicesCta } from "@/content/siteConfig";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn, DURATIONS } from "@/lib/utils";

const bySlug = (slug: string) => services.find((s) => s.slug === slug)!;

const TITLE_CLASS: Record<"lg" | "md" | "sm", string> = {
  lg: "text-h2",
  md: "text-h3",
  sm: "text-base font-bold",
};

/** Drives one node's opacity/scale off the same scroll-progress value that
 * fills the spine, at a matching fractional window — so the line visually
 * reaches a node right as it connects, instead of two effects that could
 * drift out of sync. */
function useNodeMotion(progress: MotionValue<number>, index: number, total: number, reduced: boolean) {
  const start = index / total;
  const end = start + (1 / total) * 0.6;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const scale = useTransform(progress, [start, end], [0.94, 1]);
  return reduced ? { opacity: 1, scale: 1 } : { opacity, scale };
}

function ServiceNode({
  service,
  size,
  indentRem,
  motionStyle,
}: {
  service: Service;
  size: "lg" | "md" | "sm";
  indentRem: number;
  motionStyle: { opacity: number | MotionValue<number>; scale: number | MotionValue<number> };
}) {
  return (
    <motion.div className="relative" style={{ paddingLeft: `${indentRem}rem`, ...motionStyle }}>
      <span
        className="absolute top-6 h-px bg-line"
        style={{ left: 0, width: `${indentRem}rem` }}
        aria-hidden="true"
      />
      <span
        className="absolute top-[1.35rem] h-1.5 w-1.5 rounded-full bg-blue"
        style={{ left: `${indentRem - 0.1875}rem` }}
        aria-hidden="true"
      />
      <Link href={`/services/${service.slug}`} className="group block w-fit">
        <span className="label-eyebrow">[ {service.id} ]</span>
        <h3 className={cn(TITLE_CLASS[size], "mt-2 text-ink transition-colors duration-300 group-hover:text-blue")}>
          {service.title}
        </h3>
        <p className={cn("mt-2 text-ink-soft", size === "sm" ? "max-w-xs text-xs" : "max-w-md text-sm")}>
          {service.shortDesc}
        </p>
      </Link>
    </motion.div>
  );
}

/**
 * "Individual capabilities assemble into one complete operating system."
 * One spine, drawing itself in as the visitor scrolls; six capabilities
 * branch off it at a position and size that reflects their real role in a
 * project (foundation → core build → content → output), not an equal-
 * weight grid. No cards, no icons.
 */
export function Services({ showHeading = true }: { showHeading?: boolean }) {
  const reduced = useReducedMotion();
  const diagramRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: diagramRef, offset: ["start 0.85", "end 0.55"] });

  const branding = useNodeMotion(scrollYProgress, 0, 6, reduced);
  const design = useNodeMotion(scrollYProgress, 1, 6, reduced);
  const build = useNodeMotion(scrollYProgress, 2, 6, reduced);
  const photo = useNodeMotion(scrollYProgress, 3, 6, reduced);
  const video = useNodeMotion(scrollYProgress, 4, 6, reduced);
  const growth = useNodeMotion(scrollYProgress, 5, 6, reduced);

  return (
    <section id="services" className="relative border-t border-line">
      <div className="section-shell section-py-spacious">
        {showHeading && (
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <h2 className="max-w-2xl text-h2 text-ink">{servicesIntro.headingLines.join(" ")}</h2>
          </Reveal>
        )}

        <div ref={diagramRef} className={cn("relative", showHeading ? "mt-20 md:mt-28" : "")}>
          <div className="absolute inset-y-0 left-0 w-px bg-line" aria-hidden="true" />
          <motion.div
            className="absolute inset-y-0 left-0 w-px bg-blue"
            style={{ scaleY: reduced ? 1 : scrollYProgress, transformOrigin: "top" }}
            aria-hidden="true"
          />

          <div className="flex flex-col gap-14 md:gap-20">
            <ServiceNode service={bySlug("branding-identity")} size="md" indentRem={2.5} motionStyle={branding} />
            <ServiceNode service={bySlug("product-design")} size="lg" indentRem={2.5} motionStyle={design} />
            <ServiceNode service={bySlug("web-app-development")} size="lg" indentRem={2.5} motionStyle={build} />
            <ServiceNode
              service={bySlug("ai-product-photography")}
              size="sm"
              indentRem={5}
              motionStyle={photo}
            />
            <ServiceNode service={bySlug("ai-video")} size="sm" indentRem={5} motionStyle={video} />
            <ServiceNode service={bySlug("seo-growth")} size="md" indentRem={2.5} motionStyle={growth} />
          </div>
        </div>

        <Reveal duration={DURATIONS.standard} delay={0.1} className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue to-blue/80 px-8 py-12 sm:px-12">
            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h3 className="max-w-lg text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl">
                  {servicesCta.heading.replace(servicesCta.headingHighlight, "").trim()}{" "}
                  <span className="text-magenta">{servicesCta.headingHighlight}</span>
                </h3>
                <p className="mt-3 max-w-md text-paper/80">{servicesCta.body}</p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {servicesCta.badges.map((b) => (
                    <span key={b} className="text-sm font-semibold text-paper/90">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/contact"
                className="hover-lift font-avenir group inline-flex w-fit items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm text-ink"
              >
                {servicesCta.button}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div
              className="pointer-events-none absolute bottom-0 right-0 grid grid-cols-6 gap-1 p-6 opacity-70"
              aria-hidden="true"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  className="h-3 w-3"
                  style={{
                    background:
                      i % 3 === 0 ? "var(--paper)" : i % 3 === 1 ? "var(--magenta)" : "transparent",
                    opacity: i % 3 === 2 ? 0 : 0.5 + ((i * 7) % 5) / 10,
                  }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
