import Link from "next/link";
import { ArrowUpRight, ChevronRight, Mail, Network } from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Logo } from "@/components/Logo";
import { MarkImg } from "@/components/MarkImg";
import { Spotlight } from "@/components/ui/Spotlight";
import { footer, brand } from "@/content/siteConfig";

const SOCIAL_ICONS: Record<string, typeof FaFacebook> = {
  Facebook: FaFacebook,
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
};

/** Slow expo settle. Everything that fades here shares it, so the footer
 * lights and dims as one surface instead of as a set of widgets. */
const EASE = "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]";

/** The plate's glyph doesn't move on hover — its wash deepens and the mark
 * itself starts to glow, as if the light landing on the card reached it. */
const iconPlate = `relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--magenta)]/14 text-[var(--magenta)] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition-[background-color,box-shadow,filter] duration-700 ${EASE} group-hover:bg-[var(--magenta)]/26 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] group-hover:[filter:drop-shadow(0_0_7px_rgba(255,46,147,0.75))]`;

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
        <span className={`text-[11px] text-white/45 transition-colors duration-700 ${EASE} group-hover:text-white/65`}>
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
      <span className="label-eyebrow !text-[0.68rem] !text-[var(--magenta)]">{children}</span>
    </span>
  );
}

export function Footer() {
  const waNumber = footer.contact.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer className="relative overflow-hidden bg-[#0f0f14] px-6 pb-6 pt-10 text-white sm:px-8 lg:px-12">
      {/* Magenta hairline capping the footer — the same brand rule that
         separates the CTA band above it, run edge to edge. */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#6d1140,var(--magenta),#ff7ac0,var(--magenta),#6d1140)]" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-7">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.15fr_0.7fr]">
          {/* Brand */}
          <div className="flex max-w-sm flex-col gap-3">
            <Logo imgClassName="h-9 w-auto brightness-0 invert" sizes="200px" />
            <p className="text-[13px] leading-relaxed text-white/65">{footer.description}</p>
            <p className="text-[13px] leading-relaxed text-white/65">{brand.tagline}</p>
            <p className="border-l-2 border-[var(--magenta)] pl-3 text-[13px] font-semibold text-white">
              {footer.foundingLine}
            </p>
          </div>

          {/* Navigate */}
          <div className="flex flex-col gap-1.5">
            <Eyebrow>Navigate</Eyebrow>
            <div className="flex flex-col">
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
            <Spotlight href={`https://wa.me/${waNumber}`} external>
              <CardBody title="Contact through WhatsApp" sub="We usually reply fast">
                <SiWhatsapp className="h-4 w-4" />
              </CardBody>
            </Spotlight>
            <Spotlight href={`https://t.me/${footer.contact.telegram}`} external>
              <CardBody title="Contact via Telegram" sub="Let&rsquo;s connect">
                <SiTelegram className="h-4 w-4" />
              </CardBody>
            </Spotlight>
          </div>

          {/* Follow */}
          <div className="flex flex-col gap-2">
            <Eyebrow>Follow</Eyebrow>
            <div className="flex items-center gap-2">
              {footer.socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.label];
                return (
                  <Spotlight
                    key={s.href}
                    href={s.href}
                    external
                    ariaLabel={s.label}
                    // Tighter light on a 44px chip: the card's radii would
                    // wash the whole thing flat.
                    rim={70}
                    wash={90}
                    className="h-11 w-11"
                  >
                    <span className="relative z-10 flex h-full w-full items-center justify-center">
                      <Icon
                        className={`h-4 w-4 text-white/85 transition-[color,filter] duration-700 ${EASE} group-hover:text-[var(--magenta)] group-hover:[filter:drop-shadow(0_0_8px_rgba(255,46,147,0.8))]`}
                      />
                    </span>
                  </Spotlight>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/10" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mark in a lit disc — the wordmark already ran up top, so the
               baseline gets the icon alone. */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black shadow-[0_0_18px_rgba(255,46,147,0.35)]">
              <MarkImg className="h-3 w-auto brightness-0 invert" />
            </span>
            <span className="text-[11px] text-white/50">{footer.copyright}</span>

            <span aria-hidden className="hidden h-4 w-px bg-white/12 sm:block" />

            {/* The human sitemap, not /sitemap.xml — the XML is for crawlers
               (robots.txt points them at it) and renders as a raw tree in a
               browser. The plate borrows the contact rows' language at chip
               scale: nothing moves but the light and the late arrow. */}
            <Link
              href="/sitemap"
              className={`group relative flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 transition-[border-color,background-color] duration-700 ${EASE} hover:border-[var(--magenta)]/45 hover:bg-[var(--magenta)]/8`}
            >
              <Network
                aria-hidden
                className={`h-3.5 w-3.5 shrink-0 text-[var(--magenta)] transition-[filter] duration-700 ${EASE} group-hover:[filter:drop-shadow(0_0_7px_rgba(255,46,147,0.75))]`}
              />
              <span
                className={`text-[11px] font-semibold text-white/70 transition-colors duration-700 ${EASE} group-hover:text-white`}
              >
                Sitemap
              </span>
              <ArrowUpRight
                aria-hidden
                className={`h-3 w-3 shrink-0 -translate-x-1 text-[var(--magenta)] opacity-0 transition-[opacity,transform] duration-700 ${EASE} group-hover:translate-x-0 group-hover:opacity-100`}
              />
            </Link>
          </div>

          {/* Pixel lattice, fading out toward the corner — the motif from the
             hero, rendered as one masked background instead of nodes. */}
          <div
            aria-hidden
            className="hidden h-16 w-64 shrink-0 sm:block"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,46,147,0.45) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              maskImage:
                "linear-gradient(115deg, transparent 20%, black 75%), radial-gradient(ellipse at 75% 50%, black 30%, transparent 75%)",
              maskComposite: "intersect",
              WebkitMaskImage:
                "linear-gradient(115deg, transparent 20%, black 75%), radial-gradient(ellipse at 75% 50%, black 30%, transparent 75%)",
              WebkitMaskComposite: "source-in",
            }}
          />
        </div>
      </div>
    </footer>
  );
}
