import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { ProblemCloud } from "@/components/ProblemCloud";
import { WhoWeWorkFor } from "@/components/WhoWeWorkFor";
import { Process } from "@/components/Process";
import { EngagementModels } from "@/components/EngagementModels";
import { ServicesFold } from "@/components/ServicesFold";
import { FinalCta } from "@/components/FinalCta";

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

      <ProblemCloud />

      <ServicesFold />

      <WhoWeWorkFor />

      <Process />
      <EngagementModels />
      <FinalCta />
    </>
  );
}
