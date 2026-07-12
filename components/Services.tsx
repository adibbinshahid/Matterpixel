import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PixelResolve } from "@/components/PixelResolve";
import { services } from "@/content/services";
import { servicesIntro } from "@/content/siteConfig";

/** Deterministic pixel-motif glyph, unique per tile index — no two alike. */
function ServiceGlyph({ index }: { index: number }) {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  return (
    <div className="grid h-24 w-24 grid-cols-5 grid-rows-5 gap-0.5">
      {cells.map((i) => {
        const active = (i * (index + 3) + index * 5) % 7 === 0;
        const isMagenta = (i + index) % 2 === 0;
        return (
          <div
            key={i}
            className="rounded-[1px]"
            style={{
              background: active
                ? isMagenta
                  ? "var(--magenta)"
                  : "var(--blue)"
                : "var(--line)",
              opacity: active ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

export function Services({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section id="services" className="relative bg-grid px-6 py-28 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        {showHeading && (
          <Reveal>
            <p className="label-eyebrow mb-4">{servicesIntro.eyebrow}</p>
            <h2 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
              End-to-end digital, engineered for{" "}
              <span className="text-blue">{servicesIntro.headingHighlight}</span>.
            </h2>
          </Reveal>
        )}

        <RevealGroup className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${showHeading ? "mt-16" : ""}`}>
          {services.map((service, i) => (
            <RevealItem
              key={service.slug}
              className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <article className="group relative flex h-full flex-col justify-between overflow-hidden border border-line bg-paper p-8 transition-colors duration-300 hover:border-blue">
                <div
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-blue/10 via-magenta/10 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0"
                  aria-hidden="true"
                />

                <div className="relative flex items-start justify-between gap-4">
                  <span className="label-eyebrow">[ {service.id} ]</span>
                  <PixelResolve trigger="hover" cell={12}>
                    <ServiceGlyph index={i} />
                  </PixelResolve>
                </div>

                <div className="relative mt-10">
                  <h3 className="text-xl font-bold tracking-tight text-ink">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
                    {service.shortDesc}
                  </p>
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105"
                  >
                    Explore
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
