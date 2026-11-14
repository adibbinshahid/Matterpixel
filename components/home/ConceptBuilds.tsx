import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { websiteProjects } from "@/content/projects";
import { workIntro } from "@/content/siteConfig";
import { PixelSection } from "@/components/home/PixelSection";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Hl } from "@/components/home/Hl";
import { ConceptShowcase, type ConceptBuild } from "@/components/home/ConceptShowcase";

/**
 * Pixel sizes of each build's full-page capture (public/projects/<slug>/
 * full.webp — screenshots of the live demo, 1000px wide), so the frame can
 * reserve the image's box before it loads.
 */
const FULL_CAPTURE_HEIGHT: Record<string, number> = {
  shopsphere: 2721,
  scentora: 1589,
  "lcinco-pizza": 2301,
  mindwell: 2917,
};

/** Highest measured score first; ties keep catalogue order. */
const ORDER = ["shopsphere", "scentora", "lcinco-pizza", "mindwell"];

export function ConceptBuilds() {
  const builds: ConceptBuild[] = ORDER.map((slug) => websiteProjects.find((p) => p.slug === slug))
    .filter((p) => !!p)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      host: new URL(p.liveDemoUrl).host,
      score: p.lighthouse.performance,
      thumb: p.cover,
      mobile: p.mobile,
      full: { src: `/projects/${p.slug}/full.webp`, width: 1000, height: FULL_CAPTURE_HEIGHT[p.slug] ?? 2400 },
    }));

  return (
    <PixelSection tone="light" className="home-section" labelledBy="concept-builds-title">
      <div className="home-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="concept-builds-title"
            eyebrow="Concept builds"
            title={
              <>
                Four <Hl tone="blue">live sites</Hl>. Open <Hl tone="magenta">any</Hl> of them.
              </>
            }
            lede={workIntro.conceptLine}
          />
          <Link
            href="/projects"
            data-reveal="lede"
            className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-base font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            All projects
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>

        <ConceptShowcase builds={builds} />
      </div>
    </PixelSection>
  );
}
