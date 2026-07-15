import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Clapperboard,
  Code2,
  LayoutTemplate,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { services } from "@/content/services";
import { servicesIntro, servicesCta } from "@/content/siteConfig";

const ICONS = [Code2, LayoutTemplate, Sparkles, Camera, Clapperboard, TrendingUp];

export function Services({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="services" className="relative bg-magenta px-6 py-28 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {showHeading && (
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <h2 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              {servicesIntro.headingLines.join(" ")}
            </h2>
          </Reveal>
        )}

        <RevealGroup className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${showHeading ? "mt-16" : ""}`}>
          {services.map((service, i) => {
            const Icon = ICONS[i % ICONS.length];
            const blue = i % 2 === 0;
            return (
              <RevealItem key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  aria-label={`Explore ${service.title}`}
                  className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-paper p-8 shadow-[0_1px_2px_rgba(22,22,28,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-blue hover:bg-blue hover:shadow-[0_16px_40px_-12px_rgba(22,22,28,0.3)]"
                >
                  <div className="relative flex items-start justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 group-hover:bg-paper ${blue ? "bg-blue" : "bg-magenta"}`}
                    >
                      <Icon className="h-6 w-6 text-paper transition-colors duration-300 group-hover:text-blue" />
                    </span>
                    <span className="text-3xl font-extrabold text-line transition-colors duration-300 group-hover:text-paper/40">
                      {service.id}
                    </span>
                  </div>

                  <div className="relative mt-6 flex-1">
                    <h3 className="text-xl font-bold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-paper">
                      {service.title}
                    </h3>
                    <span
                      className={`mt-3 block h-0.5 w-8 transition-colors duration-300 group-hover:bg-paper ${blue ? "bg-blue" : "bg-magenta"}`}
                    />
                    <p className="mt-4 text-sm leading-relaxed text-ink-soft transition-colors duration-300 group-hover:text-paper/85">
                      {service.shortDesc}
                    </p>

                    <ul className="mt-5 flex flex-col gap-2">
                      {service.deliverables.slice(0, 4).map((d) => (
                        <li
                          key={d}
                          className="flex items-start gap-2 text-sm text-ink-soft transition-colors duration-300 group-hover:text-paper/85"
                        >
                          <span
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 transition-colors duration-300 group-hover:bg-paper ${blue ? "bg-blue" : "bg-magenta"}`}
                          />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span
                    className={`absolute bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-paper ${blue ? "bg-blue" : "bg-magenta"}`}
                  >
                    <ArrowUpRight className="h-4 w-4 text-paper transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue" />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue to-blue/80 px-8 py-12 sm:px-12">
            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div>
                <h2 className="max-w-lg text-3xl font-bold leading-[1.1] tracking-tight text-paper sm:text-4xl">
                  {servicesCta.heading.replace(servicesCta.headingHighlight, "").trim()}{" "}
                  <span className="text-magenta">{servicesCta.headingHighlight}</span>
                </h2>
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
                href="/contact"
                className="font-avenir group inline-flex w-fit items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm text-ink transition-all duration-300 hover:scale-105"
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
