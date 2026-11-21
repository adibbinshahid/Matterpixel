import Link from "next/link";
import { ArrowUpRight, ChevronRight, Mail, Network } from "lucide-react";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Logo } from "@/components/Logo";
import { MarkImg } from "@/components/MarkImg";
import { Spotlight } from "@/components/ui/Spotlight";
import { WhatsAppSpotlight } from "@/components/WhatsAppSpotlight";
import { footer, brand } from "@/content/siteConfig";

/** Slow expo settle. Everything that fades here shares it, so the footer
 * lights and dims as one surface instead of as a set of widgets. */
const EASE = "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";

/** The plate's glyph doesn't move on hover — its wash deepens and the mark
 * itself starts to glow, as if the light landing on the card reached it. */
const iconPlate = `relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--magenta)]/14 text-[var(--magenta)] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition-[background-color,box-shadow,filter] duration-700 ${EASE} group-hover:bg-[var(--magenta)]/26 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] group-hover:text-white`;

/** Contact rows carry one affordance: a corner arrow that arrives late and
 * quietly, rather than an icon that jumps. */
function CardBody({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <span className="relative z-10 flex items-center gap-3 px-3 py-2">
      <span className={iconPlate}>{children}</span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-semibold">{title}</span>
        <span className={`text-[12px] text-white/45 transition-colors md:text-[11px] duration-700 ${EASE} group-hover:text-white/65`}>
          {sub}
        </span>
      </span>
      <ArrowUpRight
        aria-hidden
        className={`ml-auto h-3.5 w-3.5 shrink-0 -translate-x-1 text-[var(--magenta)] opacity-0 transition-[opacity,transform] duration-700 ${EASE} group-hover:translate-x-0 group-hover:opacity-100`}
      />
    </span>
  );
}

/** Eyebrow with the brand dot in front — same mark the section labels use
 * elsewhere, at footer scale. */
function Eyebrow({ children }: { children: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-1 rounded-full bg-[var(--magenta)]" />
      <span className="label-eyebrow !text-[0.8125rem] !text-[var(--magenta)] md:!text-[0.68rem]">{children}</span>
    </span>
  );
}

export function Footer() {

  return (
    <footer className="relative overflow-hidden bg-[#0b0c0e] pb-6 pt-10 text-white">
      {/* Magenta hairline capping the footer — the same brand rule that
         separates the CTA band above it, run edge to edge. */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#6d1140,var(--magenta),#ff7ac0,var(--magenta),#6d1140)]" />

      <div className="section-shell relative flex flex-col gap-7">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.15fr]">
          {/* Brand */}
          <div className="flex max-w-sm flex-col gap-3">
            <Logo imgClassName="h-9 w-auto brightness-0 invert" sizes="200px" />
            <p className="text-base leading-normal text-white/65 md:text-[13px] md:leading-relaxed">{footer.description}</p>
            <p className="text-base leading-normal text-white/65 md:text-[13px] md:leading-relaxed">{brand.tagline}</p>
            <p className="text-[13px] font-semibold text-white">
              {footer.foundingLine}
            </p>
          </div>

          {/* Navigate */}
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Navigate</Eyebrow>
            <div className="grid grid-cols-2 gap-x-6 md:flex md:flex-col">
              {footer.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  // min-h-11 (44px) is the iOS tap minimum — the rows read
                  // compact because the gap is gone, not because the target
                  // shrank.
                  className="group flex min-h-11 items-center justify-between gap-3 text-[13px] sm:max-w-[10rem]"
                >
                  {/* The label doesn't recolour — it is replaced. The muted
                     copy rises out of the row and the lit copy takes its
                     place from below, both clipped to the line box. */}
                  <span className="relative block overflow-hidden leading-[1.35]">
                    <span
                      className={`block text-white/70 transition-transform duration-[600ms] ${EASE} group-hover:-translate-y-full`}
                    >
                      {l.label}
                    </span>
                    <span
                      aria-hidden
                      className={`absolute inset-0 block translate-y-full text-white transition-transform duration-[600ms] ${EASE} group-hover:translate-y-0`}
                    >
                      {l.label}
                    </span>
                  </span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 -translate-x-1 text-[var(--magenta)] opacity-0 transition-[opacity,transform] duration-[600ms] ${EASE} group-hover:translate-x-0 group-hover:opacity-100`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2">
            <Eyebrow>Contact</Eyebrow>
            <Spotlight href={`mailto:${footer.contact.email}`}>
              <CardBody title={footer.contact.email} sub="Send us an email">
                <Mail className="h-4 w-4" />
              </CardBody>
            </Spotlight>
            <WhatsAppSpotlight>
              <CardBody title="Contact through WhatsApp" sub="We reply within 12 hours">
                <SiWhatsapp className="h-4 w-4" />
              </CardBody>
            </WhatsAppSpotlight>
            <Spotlight href={`https://t.me/${footer.contact.telegram}`} external>
              <CardBody title="Contact via Telegram" sub="Let&rsquo;s connect">
                <SiTelegram className="h-4 w-4" />
              </CardBody>
            </Spotlight>
          </div>
        </div>

        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mark in a lit disc — the wordmark already ran up top, so the
               baseline gets the icon alone. */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black ring-1 ring-white/10">
              <MarkImg className="h-3 w-auto brightness-0 invert" />
            </span>
            <span className="text-[12px] text-white/50 md:text-[11px]">{footer.copyright}</span>

            <span aria-hidden className="hidden h-4 w-px bg-white/12 sm:block" />

            {/* The human sitemap, not /sitemap.xml — the XML is for crawlers
               (robots.txt points them at it) and renders as a raw tree in a
               browser. The plate borrows the contact rows' language at chip
               scale: nothing moves but the light and the late arrow. */}
            <Link
              href="/sitemap"
              className={`group relative flex min-h-11 items-center gap-2 rounded-lg md:min-h-9 border border-white/10 px-2.5 py-1.5 transition-[border-color,background-color] duration-700 ${EASE} hover:border-white/25 hover:bg-white/[0.04]`}
            >
              <Network
                aria-hidden
                className={`h-3.5 w-3.5 shrink-0 text-white/60 transition-colors duration-700 ${EASE} group-hover:text-white`}
              />
              <span
                className={`text-[12px] font-semibold text-white/70 transition-colors md:text-[11px] duration-700 ${EASE} group-hover:text-white`}
              >
                Sitemap
              </span>
              <ArrowUpRight
                aria-hidden
                className={`h-3 w-3 shrink-0 -translate-x-1 text-[var(--magenta)] opacity-0 transition-[opacity,transform] duration-700 ${EASE} group-hover:translate-x-0 group-hover:opacity-100`}
              />
            </Link>

            {[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex min-h-11 items-center px-1 text-[12px] font-semibold text-white/60 transition-colors duration-700 md:min-h-9 md:text-[11px] ${EASE} hover:text-white`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
