import type { Metadata } from "next";
import { GiantHeading } from "@/components/GiantHeading";
import { Services } from "@/components/Services";
import { Reveal } from "@/components/Reveal";
import { servicesIntro } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web & app development, product design, branding, AI product photography, AI video, and SEO & digital marketing — senior-led, fixed quotes, no bench.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 pb-0 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4 inline-flex items-center gap-2">
              {servicesIntro.eyebrow}
              <span className="h-px w-5 bg-blue" />
              <span className="h-1 w-1 rounded-full bg-magenta" />
            </p>
            <h1>
              <GiantHeading
                lines={[servicesIntro.headingLines[0]]}
                highlight="pixel-perfect"
                maxFontSize={56}
              />
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
              {servicesIntro.engagementNote}
            </p>
          </Reveal>
        </div>
      </section>

      <Services showHeading={false} />
    </>
  );
}
