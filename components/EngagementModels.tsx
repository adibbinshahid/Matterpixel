"use client";

import Link from "next/link";
import { ArrowRight, FileText, Users, Wrench, type LucideIcon } from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { engagementModels, engagementModelsIntro } from "@/content/engagementModels";

const ICON_BY_TITLE: Record<string, LucideIcon> = {
  "Fixed-Scope Project": FileText,
  "Dedicated Team": Users,
  "Support and Growth": Wrench,
};

function ModelCard({ model }: { model: (typeof engagementModels)[number] }) {
  const Icon = ICON_BY_TITLE[model.title] ?? FileText;

  return (
    <RevealItem className={model.featured ? "lg:-mt-6" : ""}>
      <div
        className={`glass-card group relative flex flex-col overflow-hidden rounded-[28px] p-8 transition-colors duration-500 ${
          model.featured ? "" : "border border-line group-hover:border-transparent"
        }`}
      >
        {model.featured ? (
          <span className="absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-full bg-magenta px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-paper shadow-[0_4px_16px_rgba(255,0,128,0.4)]">
            {model.tag}
          </span>
        ) : (
          <p className="absolute left-1/2 top-8 z-10 -translate-x-1/2 whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-soft transition-colors duration-500 group-hover:text-white/70">
            {model.tag}
          </p>
        )}

        {/* Featured: photo is always visible (data-visible stays true), so
           hovering only triggers the slow zoom — nothing fades or reloads.
           Side cards: photo + scrim start hidden and fade in together as
           one unit on hover, then the same zoom kicks in. Reset on
           mouse-leave rides the plain CSS transition on the media element
           (see .pricing-card-media in globals.css), not a second
           animation, so it eases back rather than snapping. */}
        <div
          aria-hidden="true"
          data-visible={model.featured ? "true" : "false"}
          className="pricing-card-media pointer-events-none absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${encodeURI(model.image)})`,
            backgroundPosition: model.imagePosition,
            maskImage: "linear-gradient(180deg, transparent 0%, black 55%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 55%)",
          }}
        />
        <div
          aria-hidden="true"
          data-visible={model.featured ? "true" : "false"}
          className="pricing-card-scrim pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(10,10,14,0.55) 0%, rgba(10,10,14,0.9) 100%)" }}
        />

        <div className="relative z-10 flex h-full flex-col">
          <span
            className={`mx-auto mt-16 flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-500 ${
              model.featured ? "bg-white/15 text-white" : "bg-blue/10 text-blue group-hover:bg-white/15 group-hover:text-white"
            }`}
          >
            <Icon className="block h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </span>

          <h3
            className={`mt-6 text-center text-2xl font-bold tracking-tight transition-colors duration-500 ${
              model.featured ? "text-white" : "text-ink group-hover:text-white"
            }`}
          >
            {model.title}
          </h3>
          <p
            className={`mt-3 text-center text-sm leading-relaxed transition-colors duration-500 ${
              model.featured ? "text-white/75" : "text-ink-soft group-hover:text-white/75"
            }`}
          >
            {model.desc}
          </p>

          <div
            className={`mt-6 border-t pt-6 transition-colors duration-500 ${
              model.featured ? "border-white/15" : "border-line group-hover:border-white/15"
            }`}
          >
            <ul className="space-y-3">
              {model.features.map((f) => (
                <li
                  key={f}
                  className={`flex gap-2.5 text-sm leading-relaxed transition-colors duration-500 ${
                    model.featured ? "text-white/85" : "text-ink-soft group-hover:text-white/85"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500 ${
                      model.featured ? "bg-white/60" : "bg-blue group-hover:bg-white/60"
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/contact"
            /* Featured card is dark at rest, so it takes the primary pill.
               The other two are light at rest and go dark only on hover —
               hence .btn-line plus the .pricing-card-cta inversion, rather
               than .btn-outline (white glass, invisible on a light card).
               That inversion lives in globals.css because .btn-line sets
               `color` in unlayered CSS and beats any utility written here. */
            className={`group mx-auto mt-8 w-fit ${
              model.featured ? "btn-brand" : "btn-line pricing-card-cta"
            }`}
          >
            {model.cta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </RevealItem>
  );
}

export function EngagementModels({ firstSection = false }: { firstSection?: boolean }) {
  return (
    <section
      className={
        firstSection
          ? "relative px-6 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36 lg:px-12 lg:pb-32 lg:pt-40"
          : "relative border-t border-line px-6 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
      }
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="text-center">
          <p className="mb-4 font-semibold uppercase tracking-[0.12em] text-ink" style={{ fontSize: "clamp(0.875rem, 0.6rem + 1.2vw, 1.5rem)" }}>
            {engagementModelsIntro.eyebrow}
          </p>
          <h2>
            <GiantHeading lines={[engagementModelsIntro.heading]} highlight={engagementModelsIntro.highlight} />
          </h2>
        </div>

        <RevealGroup className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start lg:gap-6" stagger={0.12}>
          {engagementModels.map((model) => (
            <ModelCard key={model.title} model={model} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
