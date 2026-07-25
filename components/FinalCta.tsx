import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PixelFormationVisual } from "@/components/PixelFormationVisual";
import { Reveal } from "@/components/Reveal";
import { bookingUrl } from "@/content/siteConfig";

/**
 * The homepage's closing statement — its own heading/body, distinct from
 * the founding-client CTA block on /about (that one still uses
 * foundingOffer.heading/.body verbatim), since this is the page's actual
 * final word, not a mid-flow nudge like Services.tsx's own baked-in CTA
 * banner earlier in the homepage flow.
 */
export function FinalCta() {
  return (
    <section className="relative flex h-[400px] flex-col justify-center overflow-hidden px-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <Reveal className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
            Reveal what matters.
            <br /> Build what lasts.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/85">
            We partner with ambitious businesses to design and build digital experiences that are purposeful,
            high-performing, and built to scale. Every project is led with senior-level attention from strategy
            through launch.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
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
        <PixelFormationVisual />
      </div>
    </section>
  );
}
