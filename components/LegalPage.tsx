import type { ReactNode } from "react";
import { LightPage } from "@/components/LightPage";
import { PageHero } from "@/components/PageHero";
import { ClosingCta } from "@/components/home/ClosingCta";

/**
 * Shared shell for the legal pages (privacy, terms): the article ground,
 * a plain light hero, and long-form prose styled to match the insights
 * articles. Content is passed as ordinary JSX — h2 / p / ul / a.
 */
export function LegalPage({
  title,
  updated,
  lede,
  children,
}: {
  title: string;
  /** Human date of the last edit, e.g. "21 November 2026". */
  updated: string;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <LightPage closing={<ClosingCta eyebrow="Questions" title={<>Talk to the person who runs it.</>} />}>
      <PageHero tone="light" eyebrow={`Last updated ${updated}`} lines={[title]} lede={lede} />
      <article className="pb-[72px] lg:pb-[120px]">
        <div className="home-shell">
          <div
            className={[
              "max-w-3xl text-ink-soft",
              "[&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink",
              "[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink",
              "[&_p]:mt-5 [&_p]:leading-relaxed",
              "[&_ul]:mt-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3 [&_ul]:pl-5 [&_li]:list-disc [&_li]:leading-relaxed",
              "[&_a]:font-semibold [&_a]:text-blue [&_a]:underline-offset-4 hover:[&_a]:underline",
              "[&_strong]:font-bold [&_strong]:text-ink",
            ].join(" ")}
          >
            {children}
          </div>
        </div>
      </article>
    </LightPage>
  );
}
