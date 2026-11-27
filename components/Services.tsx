import Link from "next/link";
import { ArrowUpRight, Bot, Camera, Code2, LayoutDashboard, Sparkles, TrendingUp, type LucideIcon } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { ServicesCtaBanner } from "@/components/services/ServicesCtaBanner";
import { serviceLineup, type ServiceListing } from "@/content/services";
import { servicesIntro } from "@/content/siteConfig";

const ICON_BY_SLUG: Record<string, LucideIcon> = {
  "web-app-development": Code2,
  "ai-automation": Bot,
  "business-software": LayoutDashboard,
  "branding-identity": Sparkles,
  "ai-product-photography": Camera,
  "seo-growth": TrendingUp,
};

function ServiceCard({ service }: { service: ServiceListing }) {
  const Icon = ICON_BY_SLUG[service.key] ?? Code2;
  return (
    <RevealItem className="h-full">
      <Link
        href={service.href}
        className="glass-card glass-card-blue-hover grid-box hover-lift group flex h-full flex-col rounded-[var(--mp-radius-md)] p-5 transition-[color,border-color,scale] duration-300 active:scale-[0.985] sm:p-8"
      >
        {/* Phones: icon and name share a row, so six services read as a
            tight list rather than six screen-tall panels. */}
        <div className="flex items-center gap-4 sm:block">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white sm:h-12 sm:w-12">
          <Icon
            className="h-5 w-5 group-hover:[animation:service-icon-loop_1.4s_ease-in-out_infinite]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </span>

        <h3 className="text-h3 text-h3-strong text-ink transition-colors duration-300 group-hover:text-white sm:mt-6">{service.title}</h3>
        </div>
        <p className="mt-3 max-w-md flex-1 text-sm leading-relaxed text-ink-soft transition-colors duration-300 group-hover:text-white/80">
          {service.shortDesc}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue bg-blue px-3.5 py-1.5 transition-colors duration-300 group-hover:border-transparent group-hover:bg-white/20">
            {service.startingPrice === null ? (
              <span className="text-sm font-bold tracking-tight text-white">Custom quote</span>
            ) : (
              <>
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-white/80">Starting at</span>
                <span className="text-sm font-bold tracking-tight text-white">${service.startingPrice.toLocaleString()}</span>
              </>
            )}
          </span>

          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors duration-300 group-hover:text-white">
            Learn more
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
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
export function Services({
  showHeading = true,
  /** The blue closing banner. On the services page it's rendered
   * separately at the very end of the page (after proof / work / founder /
   * process) rather than directly under the grid, so it's opt-out here. */
  showCta = true,
}: {
  showHeading?: boolean;
  showCta?: boolean;
}) {
  return (
    <section id="capabilities" className="relative scroll-mt-24 border-t border-line">
      <div className={`section-shell ${showHeading ? "section-py-spacious" : "py-[72px] lg:py-[120px]"}`}>
        {showHeading && (
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <h2 className="max-w-2xl text-h2 text-ink">{servicesIntro.headingLines.join(" ")}</h2>
          </Reveal>
        )}

        <RevealGroup
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 ${showHeading ? "mt-20 md:mt-28" : ""}`}
        >
          {serviceLineup.map((service) => (
            <ServiceCard key={service.key} service={service} />
          ))}
        </RevealGroup>

        {showCta && <ServicesCtaBanner className="mt-20" />}
      </div>
    </section>
  );
}
