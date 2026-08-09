import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { FounderFeature } from "@/components/FounderFeature";
import { foundingOffer } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "About",
  description:
    "Matterpixel pairs specialist crews in engineering, digital marketing, and AI content with one accountable lead — Md. Adib Bin Shahid, your single point of contact from first call to launch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="px-6 pb-10 pt-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">the studio</p>
            {/* One line from lg up: the size is tied to viewport width so the
                nowrap setting can never push past the 1400px container. */}
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:whitespace-nowrap lg:text-[clamp(2.75rem,4.4vw,4.5rem)]">
              A crew of specialists. One person accountable.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Engineering, digital marketing, and AI content, each run by a specialist.
              Adib directs the work and stays your single point of contact throughout.
            </p>
          </Reveal>
        </div>
      </section>

      <FounderFeature />

      <section className="relative overflow-hidden border-t border-line px-6 py-16 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px]">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              {foundingOffer.heading}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/85">
              {foundingOffer.body}
            </p>
            {/* Same two-style system as the founder block. On this magenta
                panel the primary inverts to a paper pill with magenta type
                (.btn-on-brand + .on-magenta) — the gradient has nothing to
                contrast against here. */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contact?tab=booking"
                className="btn-brand btn-on-brand on-magenta group"
              >
                Get a Free Audit
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
