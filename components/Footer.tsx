import Link from "next/link";
import { Mail } from "lucide-react";
import { FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { Logo } from "@/components/Logo";
import { footer, brand } from "@/content/siteConfig";

const SOCIAL_ICONS: Record<string, typeof FaFacebook> = {
  Facebook: FaFacebook,
  LinkedIn: FaLinkedin,
  Instagram: FaInstagram,
};

const contactButton =
  "inline-flex w-fit items-center gap-2 rounded-full bg-paper/10 px-4 py-2 text-sm text-paper transition-all duration-300 hover:scale-105 hover:bg-paper/20";

export function Footer() {
  const waNumber = footer.contact.whatsapp.replace(/[^\d]/g, "");

  return (
    <footer className="relative overflow-hidden bg-blue px-6 py-16 sm:px-8 lg:px-12">
      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-12">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="flex max-w-sm flex-col gap-5">
            <Logo imgClassName="h-[4.5rem] w-auto brightness-0 invert" />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-paper/80">{footer.description}</p>
              <p className="text-sm text-paper/80">{brand.tagline}</p>
            </div>

            <p className="text-sm font-semibold text-paper">{footer.foundingLine}</p>
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div className="flex flex-col gap-3">
              <span className="label-eyebrow !text-paper/70">Navigate</span>
              {footer.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-block w-fit origin-left text-sm text-paper/80 transition-all duration-300 hover:scale-105 hover:text-paper"
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span className="label-eyebrow !text-paper/70">Contact</span>
              <a href={`mailto:${footer.contact.email}`} className={contactButton}>
                <Mail className="h-4 w-4" />
                {footer.contact.email}
              </a>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className={contactButton}
              >
                <SiWhatsapp className="h-4 w-4" />
                {footer.contact.whatsapp}
              </a>
              <a
                href={`https://t.me/${footer.contact.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={contactButton}
              >
                <SiTelegram className="h-4 w-4" />
                {footer.contact.telegram}
              </a>
              <span className="text-sm text-paper/80">{footer.contact.location}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="label-eyebrow !text-paper/70">Follow</span>
          <div className="flex items-center gap-3">
            {footer.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.label];
              return (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/10 text-paper transition-all duration-300 hover:scale-110 hover:bg-paper/20"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-paper/25" />

        <span className="text-xs text-paper/70">{footer.copyright}</span>
      </div>
    </footer>
  );
}
