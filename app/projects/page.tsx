import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { WorkGrid } from "@/components/WorkGrid";
import { PixelField } from "@/components/PixelField";
import { projects } from "@/content/projects";
import { workIntro, siteUrl } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Four production-quality concept builds you can open and use right now — luxury eCommerce, a psychiatry clinic platform, restaurant ordering, and multi-category retail. Every one live, with its admin panel open.",
  alternates: { canonical: "/projects" },
};

/** Restates, in one line each, exactly what a prospect can verify for
 * themselves — the section's whole credibility argument. Nothing here is a
 * claim; each one is checkable in the next browser tab. Rendered as a single
 * inline strip rather than a four-column block: the grid below is the point
 * of the page and should land in the first viewport, so the proof runs as
 * one line of type instead of ~200px of stacked stats. */
const perfScores = projects.map((p) => p.lighthouse.performance);

const proofPoints = [
  { value: `${projects.length}`, label: "live builds" },
  { value: `${projects.filter((p) => p.admin).length}`, label: "admin panels" },
  /* Derived, not typed: this range and the gauge row below it come from the
   * same numbers, so a re-measured build can never leave a stale span
   * sitting at the top of the page contradicting the cards. */
  {
    value: `${Math.min(...perfScores)}–${Math.max(...perfScores)}`,
    label: "Lighthouse performance",
  },
  { value: "0", label: "stock mockups" },
];

export default function WorkPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Projects — Matterpixel",
    url: `${siteUrl}/projects`,
    hasPart: projects.map((p) => ({
      "@type": "CreativeWork",
      name: p.name,
      description: p.summary,
      url: `${siteUrl}/projects/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden px-6 pb-10 pt-28 sm:px-8 lg:px-12">
        <PixelField className="pointer-events-none absolute inset-0 z-0" />
        {/* Headline and supporting copy run side by side rather than stacked:
            the grid below is what the page is for, and every line of intro
            stacked above it pushes a card row off the first screen. */}
        <div className="relative z-10 mx-auto grid max-w-[1400px] gap-x-12 gap-y-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="label-eyebrow mb-4">{workIntro.eyebrow}</p>
            <h1 className="text-display text-ink">{workIntro.heading}</h1>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="max-w-xl leading-relaxed text-ink-soft">{workIntro.honestLine}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-5">
              {proofPoints.map((p) => (
                <div key={p.label} className="flex items-baseline gap-1.5">
                  <dd className="whitespace-nowrap text-lg font-extrabold tracking-tight text-blue">
                    {p.value}
                  </dd>
                  <dt className="text-sm text-ink-soft">{p.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <WorkGrid />
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              Your project would be the one with a real client name on it.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper/70">
              Every build above was set as our own brief. Bring us yours and we&rsquo;ll scope it
              the same way — problem first, then the build that answers it.
            </p>
            <a href="/contact?tab=booking" className="btn-brand group mt-9">
              Get a Free Audit
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
