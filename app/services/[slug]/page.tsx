import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { services, getServiceBySlug } from "@/content/services";
import { siteUrl } from "@/content/siteConfig";

const WHY_MATTERPIXEL = [
  "Senior-led from strategy to final delivery",
  "Every decision tied to measurable business outcomes",
  "Fast execution without sacrificing craft",
  "One creative partner across design, AI, and development",
  "Transparent pricing and clear timelines",
];

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.intro,
    alternates: { canonical: `/services/${service.slug}` },
    keywords: [service.metaKeyword],
    openGraph: {
      title: `${service.title} — Matterpixel`,
      description: service.intro,
      url: `${siteUrl}/services/${service.slug}`,
      type: "website",
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const breakdownSections = [
    { title: "Capabilities", items: service.capabilities },
    { title: "Performance", items: service.performance },
    { title: "Integrations", items: service.integrations },
    { title: "Deployment", items: service.deployment },
    { title: "Optional ongoing support", items: service.ongoingSupport },
    { title: "Ideal for", items: service.idealFor },
    { title: "Deliverables", items: service.fileDeliverables },
    { title: "Optional add-ons", items: service.addOns },
    { title: "Frequently requested", items: service.frequentlyRequested },
    { title: "Why clients choose this service", items: service.whyChooseUs },
  ].filter((s): s is { title: string; items: string[] } => !!s.items?.length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.intro,
    provider: { "@type": "Organization", name: "Matterpixel" },
    url: `${siteUrl}/services/${service.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="px-6 pb-16 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <Link
              href="/services"
              className="group mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:text-blue"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back to Services
            </Link>
            <p className="label-eyebrow mb-4">
              [ {service.id} ] {service.title}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              {service.heroClaim}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {service.intro}
            </p>
            <Link
              href="/contact"
              className="hover-lift font-avenir group mt-8 inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-6 py-3.5 text-sm text-paper animate-gradient-shift"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-ink">What&rsquo;s included</h2>
            <ul className="mt-6 flex flex-col gap-4">
              {service.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 text-ink-soft">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-blue" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Why Matterpixel</h2>
            <ul className="mt-6 flex flex-col gap-4">
              {WHY_MATTERPIXEL.map((w) => (
                <li key={w} className="flex items-start gap-3 text-ink-soft">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-magenta" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border border-line bg-paper-2 p-5 text-sm leading-relaxed text-ink-soft">
              {service.processNote}
            </p>
            {service.proofNote && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{service.proofNote}</p>
            )}
          </Reveal>
        </div>
      </section>

      {breakdownSections.length > 0 && (
        <section className="border-t border-line bg-paper-2 px-6 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <RevealGroup className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {breakdownSections.map(({ title, items }) => (
                <RevealItem key={title}>
                  <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
                  <ul className="mt-4 flex flex-col gap-3">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-ink-soft">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-ink px-6 py-10 text-paper sm:px-8 lg:px-12">
        <Reveal className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <h2 className="text-xl font-bold tracking-tight text-paper sm:text-2xl">
            See the work behind the promise — visit our projects.
          </h2>
          <Link
            href="/projects"
            className="hover-lift font-avenir group inline-flex shrink-0 items-center gap-2 rounded-full bg-paper px-6 py-3.5 text-sm text-ink hover:bg-blue hover:text-paper"
          >
            View all projects
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </section>

      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-6">FAQ</p>
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-ink">
              Questions worth asking before you buy this.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Accordion items={service.faq} />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-blue" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              Ready to talk {service.title.toLowerCase()}?
            </h2>
            <Link
              href="/contact"
              className="hover-lift font-avenir group mt-8 inline-flex items-center gap-2 rounded-full bg-paper px-7 py-4 text-sm text-ink hover:bg-ink hover:text-paper"
            >
              Start a Project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
