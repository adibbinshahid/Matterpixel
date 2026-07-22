import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { WorkTeaser } from "@/components/WorkTeaser";
import { Process } from "@/components/Process";
import { ServicesFold } from "@/components/ServicesFold";
import { FinalCta } from "@/components/FinalCta";
import { Reveal } from "@/components/Reveal";
import { workIntro } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "Matterpixel — We build what matters. Down to the pixel.",
  description:
    "A new digital studio engineering fast, accessible, senior-led web products. 90+ PageSpeed guaranteed. See our demo builds and take on a founding-client project.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />

      <ServicesFold />

      <section className="border-t border-line px-6 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4">{workIntro.eyebrow}</p>
            <h2 className="max-w-2xl text-h1 text-ink">{workIntro.heading}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">{workIntro.honestLine}</p>
          </Reveal>

          <div className="mt-12">
            <WorkTeaser />
          </div>
        </div>
      </section>

      <Process />
      <FinalCta />
    </>
  );
}
