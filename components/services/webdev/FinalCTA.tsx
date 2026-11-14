"use client";

import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import { CtaLink } from "@/components/CtaLink";

export function FinalCTA() {
  return (
    <section className="panel-blue relative overflow-hidden border-t border-line px-6 py-16 sm:px-8 lg:px-12">
      <div className="relative mx-auto max-w-[1400px] text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl">
            <GiantHeading lines={["Got something", "worth building?"]} maxFontSize={56} />
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <CtaLink section="closing" cta="book" className="btn-on-brand on-blue" />
            <CtaLink section="closing" cta="quote" variant="text" className="text-paper" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
