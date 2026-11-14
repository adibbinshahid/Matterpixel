import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { FounderFeature } from "@/components/FounderFeature";
import { CrewThread } from "@/components/CrewThread";
import { FoundingRoster } from "@/components/FoundingRoster";
import { PixelField } from "@/components/PixelField";

export const metadata: Metadata = {
  title: "About",
  description:
    "Matterpixel is founder-led, built with vetted specialists in engineering, digital marketing, and AI content — Md. Adib Bin Shahid is your single point of contact from first call to launch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-10 pt-28 sm:px-8 lg:px-12">
        <PixelField className="pointer-events-none absolute inset-0 z-0" />
        <div className="relative z-10 mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">the studio</p>
            {/* One line from lg up: the size is tied to viewport width so the
                nowrap setting can never push past the 1400px container. */}
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:whitespace-nowrap lg:text-[clamp(2.75rem,4.4vw,4.5rem)]">
              Vetted specialists. One person accountable.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              Founder-led, built with vetted specialists in engineering, digital marketing, and AI
              content. Adib directs the work and stays your single point of contact throughout.
            </p>
          </Reveal>
        </div>
      </section>

      <FounderFeature />

      <CrewThread />

      <FoundingRoster />
    </>
  );
}
