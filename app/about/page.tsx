import type { Metadata } from "next";
import { FounderFeature } from "@/components/FounderFeature";
import { CrewThread } from "@/components/CrewThread";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";
import { foundingOffer } from "@/content/siteConfig";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Founder-led by Adib Bin Shahid, built with vetted specialists in engineering, growth, AI automation and content. One person accountable from call to launch.",
  path: "/about",
  eyebrow: "About the studio",
});

export default function AboutPage() {
  return (
    <DarkPage>
      <PageHero
        eyebrow="the studio"
        lines={[
          <>
            Vetted <Hl tone="blue">specialists</Hl>.
          </>,
          <>
            One person <Hl tone="magenta">accountable</Hl>.
          </>,
        ]}
        lede="Founder-led, built with vetted specialists in engineering, digital marketing, AI automation and AI content. Adib directs the work and stays your single point of contact throughout."
        tone="light"
      />
      <div className="home-blue relative">
        <FounderFeature />
      </div>
      <CrewThread />
      <ClosingCta
        eyebrow={foundingOffer.eyebrow}
        title={
          <>
            A few projects. Full <Hl tone="magenta">attention</Hl>.
          </>
        }
        lede={foundingOffer.body}
        note={`${foundingOffer.terms} ${foundingOffer.micro}`}
      />
    </DarkPage>
  );
}
