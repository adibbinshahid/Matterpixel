import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ProblemPicker } from "@/components/services/ProblemPicker";
import { getPackageProofs } from "@/components/services/ServiceFinder";
import { ConceptBuilds } from "@/components/home/ConceptBuilds";
import { FounderStrip } from "@/components/home/FounderStrip";
import { PixelSection } from "@/components/home/PixelSection";
import { HomeFaq } from "@/components/home/HomeFaq";
import { ClosingCta } from "@/components/home/ClosingCta";
import { DriftGrid } from "@/components/home/DriftGrid";
import { StoryChapters, type Chapter } from "@/components/home/StoryChapters";
import { Process } from "@/components/Process";
import { EngagementModels } from "@/components/EngagementModels";
import { WhoWeWorkFor } from "@/components/WhoWeWorkFor";
import { WhiteLabel } from "@/components/WhiteLabel";
import { problemPackages } from "@/content/packages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Matterpixel — Web Development & AI Automation Studio",
  absoluteTitle: true,
  description:
    "Founder-led studio building fast websites, web apps and AI automation for growing brands. Fixed quotes, fast delivery, and you own everything we build.",
  path: "/",
});

/** The homepage's story on a phone, in reading order: the problem, proof
 * it gets solved, the person who solves it, what it costs, how it runs,
 * whether it fits your business, the agency route, and the questions
 * left. Each anchor is an element inside that chapter's section. */
const CHAPTERS: Chapter[] = [
  { label: "The problem", anchor: '[aria-label="Start with the problem"]' },
  { label: "The proof", anchor: "#concept-builds-title" },
  { label: "The person", anchor: "#founder-strip-title" },
  { label: "The price", anchor: "#engagement-title" },
  { label: "The process", anchor: "#process-title" },
  { label: "Your industry", anchor: "#industries-title" },
  { label: "For agencies", anchor: "#white-label-title" },
  { label: "Questions", anchor: "#faq-title" },
];

export default function Home() {
  return (
    <div className="home relative">
      <DriftGrid />
      <StoryChapters chapters={CHAPTERS} />
      <Hero />
      <Stats />

      <PixelSection className="home-section" label="Start with the problem">
        <ProblemPicker packages={problemPackages} proofs={getPackageProofs()} />
      </PixelSection>

      <ConceptBuilds />
      <FounderStrip />

      <EngagementModels />
      <Process />
      <WhoWeWorkFor />
      <WhiteLabel />
      <HomeFaq />
      <ClosingCta />
    </div>
  );
}
