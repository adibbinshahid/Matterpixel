import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { servicesCta } from "@/content/siteConfig";
import { DURATIONS } from "@/lib/utils";

/**
 * The blue closing banner, lifted verbatim out of Services.tsx so the
 * services page can place it where it belongs — at the end of the page,
 * after the proof/work/founder/process run — instead of stranded halfway
 * down directly beneath the service grid.
 *
 * Content, colors, badges and button are unchanged; this is a move, not a
 * redesign. Services.tsx still renders it by default (`showCta`), so any
 * other consumer of that component is unaffected.
 */
export function ServicesCtaBanner({ className }: { className?: string }) {
  return (
    <Reveal duration={DURATIONS.standard} delay={0.1} className={className}>
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

          <Link href="/contact?tab=booking" className="btn-brand btn-on-brand on-blue group w-fit">
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
                background: i % 3 === 0 ? "var(--paper)" : i % 3 === 1 ? "var(--magenta)" : "transparent",
                opacity: i % 3 === 2 ? 0 : 0.5 + ((i * 7) % 5) / 10,
              }}
            />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
