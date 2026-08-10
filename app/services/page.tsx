import type { Metadata } from "next";
import { Services } from "@/components/Services";
import { ServicesHero } from "@/components/services/ServicesHero";
import { TheStandard } from "@/components/services/TheStandard";
import { ProofBoard } from "@/components/services/ProofBoard";
import { FounderEditorial } from "@/components/services/FounderEditorial";
import { ProcessSystem } from "@/components/services/ProcessSystem";
import { FinalCta } from "@/components/FinalCta";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web & app development, AI automation, branding, AI product photography, AI video, and SEO & digital marketing — senior-led, fixed quotes, no bench.",
  alternates: { canonical: "/services" },
};

/**
 * Section rhythm. Each beat deliberately runs on a different visual
 * grammar, so the page never resolves into one repeated layout:
 *
 *   ServicesHero    cursor-reactive pixel field, giant headline
 *   TheStandard     two-column editorial ledger, hairline rules
 *   Services        the six-service card system (unchanged)
 *   ProofBoard      oversized blue numerals on an irregular, cropped grid
 *   FounderEditorial portrait plate bled off-edge, counter-parallax type
 *   ProcessSystem   blue full-bleed, sticky rail + scroll-driven connector
 *   FinalCta        magenta full-bleed close — distinct copy/grammar from
 *                    ProofBoard's own CTA, not a repeat of it. The page
 *                    used to end on ServicesCtaBanner (the "Built with
 *                    intent. Backed by results." card), but that duplicated
 *                    ProofBoard's heading, badges, and button verbatim —
 *                    cut in favor of the homepage's closing statement.
 *
 * They share one system through the square-pixel mark, the mono/uppercase
 * annotation register, and the blue/magenta accent pairing — not through a
 * repeated container shape.
 */
export default function ServicesPage() {
  return (
    <>
      <ServicesHero />

      <TheStandard />

      {/* The service system itself. `showCta` is off because the blue
          banner closes the page below rather than interrupting here. */}
      <Services showHeading={false} showCta={false} />

      <ProofBoard />

      <FounderEditorial />

      <ProcessSystem />

      <FinalCta />
    </>
  );
}
