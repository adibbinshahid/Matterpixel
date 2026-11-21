import type { Metadata } from "next";
import { Services } from "@/components/Services";
import { ServiceFinder } from "@/components/services/ServiceFinder";
import { ProofBoard } from "@/components/services/ProofBoard";
import { FounderEditorial } from "@/components/services/FounderEditorial";
import { ProcessSystem } from "@/components/services/ProcessSystem";
import { ClosingCta } from "@/components/home/ClosingCta";
import { DarkPage } from "@/components/DarkPage";
import { Hl } from "@/components/home/Hl";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services",
  description:
    "Web and app development, AI automation, business software, branding, AI product visuals and SEO. Founder-led, with fixed quotes before work starts.",
  path: "/services",
  eyebrow: "Services",
});

/**
 * Section rhythm. Each beat deliberately runs on a different visual
 * grammar, so the page never resolves into one repeated layout:
 *
 *   ServiceFinder   problem picker → stack builder → custom brief (also
 *                    the homepage's services section); carries the h1
 *   ProofBoard      oversized blue numerals on an irregular, cropped grid
 *   Services        the six-service card system (unchanged)
 *   FounderEditorial portrait plate bled off-edge, counter-parallax type
 *   ProcessSystem   blue full-bleed, sticky rail + scroll-driven connector
 *   ClosingCta      the site's one closing beat (as on every page); here
 *                    the quote leads, since the visitor is pricing a build.
 *
 * They share one system through the square-pixel mark, the mono/uppercase
 * annotation register, and the blue/magenta accent pairing — not through a
 * repeated container shape.
 */
export default function ServicesPage() {
  return (
    <DarkPage>
      <ServiceFinder firstSection />

      <ProofBoard />

      {/* The service system itself. `showCta` is off because the blue
          banner closes the page below rather than interrupting here. */}
      <Services showHeading={false} showCta={false} />

      <FounderEditorial />

      <ProcessSystem />

      <ClosingCta
        eyebrow="Fixed quote"
        title={
          <>
            Know the <Hl tone="blue">price</Hl> before we <Hl tone="magenta">build</Hl>.
          </>
        }
        lede="Send the brief and get a fixed quote, timeline included. Prefer to talk it through first? Book a free audit call."
        lead="quote"
      />
    </DarkPage>
  );
}
