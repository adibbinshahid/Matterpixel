import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

/**
 * The homepage's closing statement — distinct from the founding-client CTA
 * block on /about (that one still uses foundingOffer.heading/.body
 * verbatim), since this is the page's actual final word, not a mid-flow
 * nudge like ServicesFold.tsx's own baked-in CTA banner earlier in the
 * homepage flow. Mirrors that banner's layout with copy/button sides
 * swapped: copy left, button right there vs. button left, copy right here.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
      <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
      <Reveal className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center gap-5 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/contact?tab=booking"
          className="btn-brand btn-on-brand on-magenta group shrink-0"
        >
          Get a Free Audit
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
        <p className="max-w-2xl text-center leading-snug text-paper lg:text-right">
          <span className="block text-2xl font-bold sm:text-3xl">Let&rsquo;s build your next win.</span>
          <span className="mt-1 block text-sm text-paper/85 sm:text-base">
            Claim your free audit and allow us to see exactly what&rsquo;s holding your growth back.
          </span>
        </p>
      </Reveal>
    </section>
  );
}
