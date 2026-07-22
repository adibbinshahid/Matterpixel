import type { Metadata } from "next";
import { Services } from "@/components/Services";
import { Reveal } from "@/components/Reveal";
import { FeatureStrip } from "@/components/FeatureStrip";
import { servicesIntro } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web & app development, product design, branding, AI product photography, AI video, and technical SEO — senior-led, fixed quotes, no bench.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-4 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4 inline-flex items-center gap-2">
              {servicesIntro.eyebrow}
              <span className="h-px w-5 bg-blue" />
              <span className="h-1 w-1 rounded-full bg-magenta" />
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {servicesIntro.headingLines[0]}
              <br />
              {servicesIntro.headingLines[1]}
              <br />
              <span className="bg-gradient-to-r from-blue to-magenta bg-clip-text text-transparent">
                {servicesIntro.headingLines[2]}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              {servicesIntro.engagementNote}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-16 w-full">
            <FeatureStrip big />
          </Reveal>
        </div>
      </section>

      <Services showHeading={false} />
    </>
  );
}
