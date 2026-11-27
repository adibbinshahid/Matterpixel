import { ArrowUpRight, Check, Mail } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { PixelSection } from "@/components/home/PixelSection";
import { Hl } from "@/components/home/Hl";
import { whiteLabel, ctas } from "@/content/siteConfig";
import { PartnerLink } from "@/components/CtaLink";

/**
 * Agency / white-label pitch: a full-bleed magenta section before the FAQ,
 * copy on the left, the three terms and the action on the right.
 */
export function WhiteLabel() {
  return (
    <PixelSection tone="magenta" id="white-label" className="home-section" labelledBy="white-label-title">
      <div className="home-shell grid gap-8 md:gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p
            data-reveal="eyebrow"
            className="flex items-center gap-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-ink-soft md:text-xs"
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
          <p
            data-reveal="lede"
            className="mt-4 max-w-[52ch] text-[0.9375rem] font-normal leading-relaxed text-ink-soft max-md:text-white/85 md:mt-5 md:text-lg"
          >
            {whiteLabel.body}
          </p>
        </div>

        <div data-reveal="block">
          <ul className="flex flex-col gap-2.5 sm:gap-3.5">
            {whiteLabel.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[0.9375rem] font-medium text-ink sm:text-lg sm:font-semibold">
                <span className="mt-px flex h-5 w-5 shrink-0 sm:mt-0.5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white text-magenta">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {b}
              </li>
            ))}
          </ul>
          {/* Agencies talk to Adib directly — no form. Both links open with
              the same short template pre-typed. On magenta the magenta
              primary would vanish: the pill inverts to white. */}
          {/* Phones: the two channels side by side, equal width. */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <PartnerLink
              channel="whatsapp"
              href={ctas.partner.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand btn-on-magenta group w-full max-sm:px-3 sm:w-fit"
            >
              <SiWhatsapp className="h-4 w-4 shrink-0" aria-hidden="true" />
              {ctas.partner.whatsapp.label}
              <ArrowUpRight className="h-4 w-4 max-sm:hidden transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </PartnerLink>
            <PartnerLink channel="email" href={ctas.partner.email.href} className="btn-outline wl-email group w-full max-sm:px-3 sm:w-fit">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              {ctas.partner.email.label}
            </PartnerLink>
          </div>
        </div>
      </div>
    </PixelSection>
  );
}
