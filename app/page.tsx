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
import { MobileStickyCta } from "@/components/home/MobileStickyCta";
import { Process } from "@/components/Process";
import { EngagementModels } from "@/components/EngagementModels";
import { WhoWeWorkFor } from "@/components/WhoWeWorkFor";
import { WhiteLabel } from "@/components/WhiteLabel";
import { problemPackages } from "@/content/packages";

export const metadata: Metadata = {
  title: "Matterpixel — We build what matters. Down to the pixel.",
  description:
    "We build websites and AI systems that win customers and save hours. Founder-led digital studio. Fixed prices. Fast delivery. You own everything we build.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="home relative">
      <DriftGrid />
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
      <MobileStickyCta />
    </div>
  );
}
