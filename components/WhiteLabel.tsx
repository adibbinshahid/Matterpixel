import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PixelSection } from "@/components/home/PixelSection";
import { Hl } from "@/components/home/Hl";
import { whiteLabel, PARTNER_URL } from "@/content/siteConfig";

/**
 * Agency / white-label pitch: a full-bleed magenta section before the FAQ,
 * copy on the left, the three terms and the action on the right.
 */
export function WhiteLabel() {
  return (
    <PixelSection tone="magenta" className="home-section" labelledBy="white-label-title">
      <div className="home-shell grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p
            data-reveal="eyebrow"
            className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-magenta" />
            {whiteLabel.eyebrow}
          </p>
          <h2
            id="white-label-title"
            data-reveal="title"
            className="mt-4 text-balance text-[clamp(2rem,1.35rem+2.6vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.025em] text-ink"
          >
            Your trusted <Hl tone="blue">white-label</Hl> development partner.
          </h2>
          <p data-reveal="lede" className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink-soft sm:text-lg">
            {whiteLabel.body}
          </p>
        </div>

        <div data-reveal="block">
          <ul className="flex flex-col gap-3.5">
            {whiteLabel.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-base font-semibold text-ink sm:text-lg">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-magenta">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          {/* On magenta the magenta primary would vanish: the same pill
              inverts to white with a magenta label. */}
          <Link href={PARTNER_URL} className="btn-brand btn-on-magenta group mt-8 w-fit">
            {whiteLabel.cta}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </PixelSection>
  );
}
