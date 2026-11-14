import { Reveal } from "@/components/Reveal";
import { CtaLink } from "@/components/CtaLink";

/**
 * The homepage's closing statement — distinct from the founding-client CTA
 * block on /about (that one is FoundingRoster.tsx, on foundingOffer),
 * since this is the page's actual final word, not a mid-flow
 * nudge like ServicesFold.tsx's own baked-in CTA banner earlier in the
 * homepage flow. Mirrors that banner's layout with copy/button sides
 * swapped: copy left, button right there vs. button left, copy right here.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-6 py-10 sm:px-8 sm:py-12 lg:px-12">
      <div className="absolute inset-0 bg-magenta" aria-hidden="true" />
      {/* `flex-col-reverse` below `lg`: the DOM order (button, then copy) is
         the desktop left-to-right reading order, but stacked vertically it
         put the button above the sentence explaining what it gets you. Reversing the column restores headline-then-button on phones
         without disturbing the desktop row. */}
      <Reveal className="relative mx-auto flex w-full max-w-[1400px] flex-col-reverse items-center gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* On /services the visitor is pricing a build, so the quote leads
           and the audit call is the quieter alternative. */}
        <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <CtaLink cta="quote" className="btn-on-brand on-magenta" />
          <CtaLink cta="book" variant="text" className="text-paper" />
        </div>
        <p className="max-w-2xl text-center leading-snug text-paper lg:text-right">
          <span className="block text-2xl font-bold sm:text-3xl">Let&rsquo;s build your next win.</span>
          <span className="mt-1 block text-sm text-paper/85 sm:text-base">
            A fixed price for exactly what you need, agreed before any work begins.
          </span>
        </p>
      </Reveal>
    </section>
  );
}
