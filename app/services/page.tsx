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

function CubeDecoration() {
  return (
    <div
      className="pointer-events-none absolute right-6 top-20 hidden h-40 w-40 sm:block lg:right-12 lg:h-56 lg:w-56"
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(255,255,255,0.5)",
            clipPath: "polygon(50% 0%, 100% 25%, 50% 50%, 0% 25%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(44,75,255,0.7)",
            clipPath: "polygon(0% 25%, 50% 50%, 50% 100%, 0% 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(22,22,28,0.4)",
            clipPath: "polygon(50% 50%, 100% 25%, 100% 75%, 50% 100%)",
          }}
        />
      </div>
      <span className="absolute -right-2 -top-2 h-3 w-3 bg-paper/50" />
      <span className="absolute -bottom-3 left-6 h-2 w-2 bg-blue/60" />
      <span className="absolute -right-6 bottom-10 h-2.5 w-2.5 bg-paper/40" />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-magenta px-6 pb-4 pt-32 sm:px-8 lg:px-12">
        <CubeDecoration />
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4 inline-flex items-center gap-2 !text-paper">
              {servicesIntro.eyebrow}
              <span className="h-px w-5 bg-paper" />
              <span className="h-1 w-1 rounded-full bg-blue" />
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-paper sm:text-5xl">
              {servicesIntro.headingLines[0]}
              <br />
              {servicesIntro.headingLines[1]}
              <br />
              <span className="text-blue">{servicesIntro.headingLines[2]}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-paper/80">
              {servicesIntro.engagementNote}
            </p>
          </Reveal>
        </div>
      </section>

      <Services showHeading={false} />
    </>
  );
}
