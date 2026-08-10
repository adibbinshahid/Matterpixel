"use client";

import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import { PixelField } from "@/components/PixelField";
import { servicesIntro } from "@/content/siteConfig";

/**
 * The hero, unchanged in concept: same eyebrow, same
 * "end-to-end pixel-perfect execution." headline at the same GiantHeading
 * scale, same supporting statement.
 *
 * What's new is underneath it — PixelField lays a near-invisible pixel
 * lattice across the whole opening, and only the pixels within reach of the
 * cursor take on brand color and resolve. Nothing labels it and nothing
 * animates on load; it exists to be found by moving the mouse.
 *
 * It's also the page's connective tissue: the same square-pixel unit
 * reappears as ledger bullets in TheStandard, the gutter rule in
 * ProofBoard, registration marks on the founder plate, and the connector
 * nodes in ProcessSystem. The hero is where the visitor learns what that
 * mark means.
 */
export function ServicesHero() {
  return (
    // Bottom padding (the original had none) gives the pixel field enough
    // vertical room to actually be a field rather than a band — the detail
    // is only discoverable if there's space to move the cursor through.
    <section className="relative overflow-hidden px-6 pb-14 pt-32 sm:px-8 lg:px-12 lg:pb-20">
      {/* Field sits behind the content and is pointer-events-none
          throughout, so it can never intercept a click on the headline. */}
      <PixelField className="pointer-events-none absolute inset-0 z-0" />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label-eyebrow mb-4 inline-flex items-center gap-2">
            {servicesIntro.eyebrow}
            <span className="h-px w-5 bg-blue" />
            <span className="h-1 w-1 rounded-full bg-magenta" />
          </p>
          <h1>
            <GiantHeading
              lines={[servicesIntro.headingLines[0]]}
              highlight="pixel-perfect"
              maxFontSize={56}
            />
          </h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-ink-soft sm:whitespace-nowrap">
            {servicesIntro.engagementNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
