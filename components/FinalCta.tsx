import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { foundingOffer, bookingUrl } from "@/content/siteConfig";

/**
 * The homepage's closing statement — distinct heading from the founding-
 * client CTA block on /about (same true offer/body copy, not duplicated
 * verbatim) since this is the page's actual final word, not a mid-flow nudge
 * like Services.tsx's own baked-in CTA banner earlier in the homepage flow.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line px-6 py-24 sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1400px]">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
            Ready to reveal what matters for your brand?
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/85">{foundingOffer.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/contact#email"
              className="hover-lift font-avenir group inline-flex items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm text-ink hover:bg-ink hover:text-paper"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-fit origin-left text-sm font-semibold text-paper underline-offset-4 transition-transform duration-300 hover:scale-105 hover:underline"
            >
              Book a 15-min intro call
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
