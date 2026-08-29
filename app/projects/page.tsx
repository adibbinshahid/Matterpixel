import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { WorkGrid } from "@/components/WorkGrid";
import { PixelField } from "@/components/PixelField";
import { projects, mediums, websiteProjects, mediaProjects, toWorkCards } from "@/content/projects";
import { workIntro, siteUrl } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Production-quality concept work you can check for yourself — four live sites with their admin panels open, plus AI product photography, campaign sets, personas, interiors, cover art, print design and short-form film. Nothing here is a mockup.",
  alternates: { canonical: "/projects" },
};

/** Restates, in one line each, exactly what a prospect can verify for
 * themselves — the section's whole credibility argument. Nothing here is a
 * claim; each one is checkable in the next browser tab. Rendered as a single
 * inline strip rather than a four-column block: the grid below is the point
 * of the page and should land in the first viewport, so the proof runs as
 * one line of type instead of ~200px of stacked stats. */
/* Scoped to the measured lane, never to `projects`. An AI still has no
 * Lighthouse score and is not a "live build", and counting it as either
 * would put a NaN in the range and a lie next to it. */
const perfScores = websiteProjects.map((p) => p.lighthouse.performance);

/* Counted across the AI lanes rather than typed, so publishing a set moves
 * this number and nobody has to remember to. */
const mediaPieces = mediaProjects.reduce((n, p) => n + p.media.length, 0);

const proofPoints = [
  { value: `${websiteProjects.length}`, label: "live builds" },
  {
    value: `${websiteProjects.filter((p) => p.admin).length}`,
    label: "admin panels",
  },
  /* Derived, not typed: this range and the gauge row below it come from the
   * same numbers, so a re-measured build can never leave a stale span
   * sitting at the top of the page contradicting the cards. */
  {
    value: `${Math.min(...perfScores)}–${Math.max(...perfScores)}`,
    label: "Lighthouse performance",
  },
  /* Replaces the old "0 stock mockups" line, which said what the section is
   * not. With the AI lanes published the same claim is better made as a
   * count of pieces we generated ourselves — and it collapses back to the
   * old line if those lanes are ever emptied. */
  mediaPieces > 0
    ? { value: `${mediaPieces}`, label: "AI stills & cuts" }
    : { value: "0", label: "stock mockups" },
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
          {/* Projected on the server — see toWorkCards for why the grid
              never imports the project content itself. */}
          <WorkGrid cards={toWorkCards(projects)} lanes={mediums} />
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
