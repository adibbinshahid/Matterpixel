import Link from "next/link";
import { Accordion } from "@/components/ui/Accordion";
import { PixelSection } from "@/components/home/PixelSection";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Hl } from "@/components/home/Hl";
import { faq, BOOKING_URL } from "@/content/siteConfig";

/**
 * The second light beat of the page: six plain answers to what a buyer
 * asks before paying a studio abroad. Ships FAQPage structured data from
 * the same list, so the markup can never disagree with the page.
 */
export function HomeFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <PixelSection tone="light" className="py-12 lg:py-16" labelledBy="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="home-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title={
              <>
                Before you <Hl tone="blue">ask</Hl>.
              </>
            }
          />
          <p data-reveal="lede" className="text-base leading-relaxed text-ink-soft md:pb-2">
            Anything not here,{" "}
            <Link
              href={BOOKING_URL}
              className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
            >
              ask on a free audit call
            </Link>
            .
          </p>
        </div>
        <div data-reveal="block" className="mt-8">
          <Accordion items={faq} reserve compact columns={2} />
        </div>
      </div>
    </PixelSection>
  );
}
