import Link from "next/link";
import { ArrowUpRight, Bot, Camera, Clapperboard, Code2, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { services, type Service } from "@/content/services";
import { servicesIntro, servicesCta } from "@/content/siteConfig";
import { DURATIONS } from "@/lib/utils";

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "web-app-development": Code2,
  "ai-automation": Bot,
  "branding-identity": Sparkles,
  "ai-product-photography": Camera,
  "ai-video": Clapperboard,
  "seo-growth": TrendingUp,
};

function ServiceCard({ service }: { service: Service }) {
  const Icon = ICON_BY_SLUG[service.slug] ?? Code2;
  return (
    <RevealItem className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="hover-lift group flex h-full flex-col rounded-[var(--mp-radius-md)] border border-line bg-paper-2 p-8 transition-colors duration-300 hover:border-blue"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue/10 text-blue transition-colors duration-300 group-hover:bg-blue group-hover:text-paper">
            <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="label-eyebrow">[ {service.id} ]</span>
        </div>

        <h3 className="mt-6 text-h3 text-ink">{service.title}</h3>
        <p className="mt-3 max-w-md flex-1 text-sm leading-relaxed text-ink-soft">{service.shortDesc}</p>

        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-blue">
          Learn more
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </RevealItem>
  );
}

/**
 * Service catalogue as a 3x2 card grid — every card links straight to its
 * own detail page (app/services/[slug]/page.tsx). Replaces the earlier
 * scroll-driven "spine" diagram: with exactly six services, a card grid
 * scans faster and makes "click for details" an obvious affordance
 * instead of an implied one.
 */
export function Services({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="services" className="relative border-t border-line">
      <div className={`section-shell ${showHeading ? "section-py-spacious" : "pb-28 pt-10 lg:pt-12"}`}>
        {showHeading && (
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <h2 className="max-w-2xl text-h2 text-ink">{servicesIntro.headingLines.join(" ")}</h2>
          </Reveal>
        )}

        <RevealGroup
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 ${showHeading ? "mt-20 md:mt-28" : ""}`}
        >
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </RevealGroup>

        <Reveal duration={DURATIONS.standard} delay={0.1} className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue to-blue/80 px-8 py-12 sm:px-12">
            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h3 className="max-w-lg text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl">
                  {servicesCta.heading.replace(servicesCta.headingHighlight, "").trim()}{" "}
                  <span className="text-magenta">{servicesCta.headingHighlight}</span>
                </h3>
                <p className="mt-3 max-w-md text-paper/80">{servicesCta.body}</p>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                  {servicesCta.badges.map((b) => (
                    <span key={b} className="text-sm font-semibold text-paper/90">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/contact?tab=booking"
                className="hover-lift font-avenir group inline-flex w-fit items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm text-ink"
              >
                {servicesCta.button}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div
              className="pointer-events-none absolute bottom-0 right-0 grid grid-cols-6 gap-1 p-6 opacity-70"
              aria-hidden="true"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  className="h-3 w-3"
                  style={{
                    background:
                      i % 3 === 0 ? "var(--paper)" : i % 3 === 1 ? "var(--magenta)" : "transparent",
                    opacity: i % 3 === 2 ? 0 : 0.5 + ((i * 7) % 5) / 10,
                  }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
