import type { Metadata } from "next";
import { Services } from "@/components/Services";
import { Reveal } from "@/components/Reveal";
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
      <section className="bg-grid px-6 pb-4 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              End-to-end digital, engineered for{" "}
              <span className="text-blue">{servicesIntro.headingHighlight}</span>.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              {servicesIntro.engagementNote}
            </p>
          </Reveal>
        </div>
      </section>

      <Services showHeading={false} />
    </>
  );
}
