import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { Process } from "@/components/Process";
import { founder, foundingOffer, bookingUrl } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "About",
  description:
    "Matterpixel is a new, founder-led studio — senior brand strategy, full-stack engineering, and production AI workflows in one person, taking a select few founding clients.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="px-6 pb-16 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">the studio</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Pixels that matter. Engineering that holds up.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Matterpixel exists on a simple premise: most studios are good at brand,
              or good at engineering, or good at production AI — rarely all three at
              once. We built this studio to be good at all three.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-grid px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">{founder.eyebrow}</p>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {founder.heading}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.8fr]">
            <Reveal delay={0.1} className="flex flex-col gap-5">
              {founder.bio.map((p) => (
                <p key={p} className="max-w-2xl leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
              {/* TODO(founder): swap in real name/photo/Fiverr profile link once approved for public use. */}
            </Reveal>

            <RevealGroup className="flex flex-col gap-4" stagger={0.08}>
              {founder.credentials.map((c) => (
                <RevealItem
                  key={c}
                  className="flex items-center gap-3 border border-line bg-paper px-5 py-4"
                >
                  <Check className="h-4 w-4 shrink-0 text-blue" />
                  <span className="font-semibold text-ink">{c}</span>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px]">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              {foundingOffer.heading}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/85">
              {foundingOffer.body}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm font-semibold text-ink transition-all duration-300 hover:scale-105 hover:bg-ink hover:text-paper"
              >
                Start a Project
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-fit origin-left text-sm font-semibold text-paper underline-offset-4 transition-transform duration-300 hover:scale-105 hover:underline"
              >
                Book a 15-min intro call
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Process />
    </>
  );
}
