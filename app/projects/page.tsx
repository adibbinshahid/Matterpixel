import type { Metadata } from "next";
import { WorkGrid } from "@/components/WorkGrid";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";
import { projects, mediums, websiteProjects, mediaProjects, toWorkCards } from "@/content/projects";
import { workIntro, siteUrl } from "@/content/siteConfig";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "Live concept builds with open admin panels, plus AI product photography, campaign sets and short-form film. Production-quality work you can check yourself.",
  path: "/projects",
  eyebrow: "Selected work",
});

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
    <DarkPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHero
        tone="blue"
        eyebrow={workIntro.eyebrow}
        lines={[
          <>
            Real custom <Hl tone="blue">code</Hl>.
          </>,
          <>
            Production <Hl tone="magenta">quality</Hl>.
          </>,
        ]}
        lede={
          <>
            <p className="font-semibold text-white">{workIntro.conceptLine}</p>
            <p className="mt-3">{workIntro.honestLine}</p>
          </>
        }
      >
        {/* The proof strip: one line of type rather than a stat block, so
            the grid below still lands in the first viewport. */}
        <dl className="flex max-w-3xl flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6">
          {proofPoints.map((p) => (
            <div key={p.label} className="flex items-baseline gap-1.5">
              <dd className="whitespace-nowrap text-lg font-extrabold tracking-tight text-white">{p.value}</dd>
              <dt className="text-sm text-ink-soft">{p.label}</dt>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="relative pb-[72px] pt-14 lg:pb-[120px] lg:pt-20">
        <div className="home-shell">
          {/* Projected on the server — see toWorkCards for why the grid
              never imports the project content itself. */}
          <WorkGrid cards={toWorkCards(projects)} lanes={mediums} />
        </div>
      </section>

      <ClosingCta
        eyebrow="Your brief next"
        title={
          <>
            Your project would be the one with a real <Hl tone="magenta">client name</Hl> on it.
          </>
        }
        lede="Every build above was set as our own brief. Bring us yours and we’ll scope it the same way: problem first, then the build that answers it."
      />
    </DarkPage>
  );
}
