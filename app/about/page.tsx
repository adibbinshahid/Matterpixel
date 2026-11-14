import type { Metadata } from "next";
import { FounderFeature } from "@/components/FounderFeature";
import { CrewThread } from "@/components/CrewThread";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";
import { foundingOffer } from "@/content/siteConfig";

export const metadata: Metadata = {
  title: "About",
  description:
    "Matterpixel is founder-led, built with vetted specialists in engineering, digital marketing, AI automation and AI content — Md. Adib Bin Shahid is your single point of contact from first call to launch.",
  alternates: { canonical: "/about" },
};

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
      />
      <FounderFeature />
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
