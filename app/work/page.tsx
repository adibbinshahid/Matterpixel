import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { WorkGrid } from "@/components/WorkGrid";
import { workIntro } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Real code, production-quality demo builds — eCommerce, wellness, restaurant ordering, and enterprise dashboards. Try each one live.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <section className="px-6 py-32 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label-eyebrow mb-4">{workIntro.eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {workIntro.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {workIntro.honestLine}
          </p>
        </Reveal>

        <div className="mt-16">
          <WorkGrid />
        </div>
      </div>
    </section>
  );
}
