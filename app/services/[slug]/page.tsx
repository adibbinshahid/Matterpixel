import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { services, getServiceBySlug } from "@/content/services";
import { siteUrl } from "@/content/siteConfig";
import { CtaLink } from "@/components/CtaLink";
import { WebDevServicePage } from "@/components/services/webdev/WebDevServicePage";
import { DarkPage } from "@/components/DarkPage";
import { PageHero } from "@/components/PageHero";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";

const WHY_MATTERPIXEL = [
  "Founder-led from strategy to final delivery",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.intro,
    provider: { "@type": "Organization", name: "Matterpixel" },
    url: `${siteUrl}/services/${service.slug}`,
  };

  if (service.slug === "web-app-development") {
    return (
      <DarkPage>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <WebDevServicePage service={service} />
      </DarkPage>
    );
  }

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
    { title: "Why choose this service", items: service.whyChooseUs },
  ].filter((s): s is { title: string; items: string[] } => !!s.items?.length);

  return (
    <DarkPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        eyebrow={`${service.id} · ${service.title}`}
        lines={[service.heroClaim]}
        lede={service.intro}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink section="hero" cta="book" />
          <CtaLink section="hero" cta="quote" variant="text" className="text-white" />
        </div>
        <Link
          href="/services"
          className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors duration-300 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1" />
          All services
        </Link>
      </PageHero>

      <section className="border-t border-line py-[72px] lg:py-[120px]">
        <div className="section-shell grid gap-16 lg:grid-cols-2">
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
            <p className="mt-6 rounded-[20px] border border-line bg-paper-2 p-5 text-sm leading-relaxed text-ink-soft">
              {service.processNote}
            </p>
            {service.proofNote && (
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{service.proofNote}</p>
            )}
          </Reveal>
        </div>
      </section>

      {breakdownSections.length > 0 && (
        <section className="border-t border-line py-[72px] lg:py-[120px]">
          <div className="section-shell">
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

      <section className="border-t border-line bg-paper-2 py-10">
        <Reveal className="section-shell flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {service.projectsNote ?? "See the work behind the promise — visit our projects."}
          </h2>
          <Link
            href="/projects"
            className="btn-outline group shrink-0"
          >
            View all projects
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </section>

      <section className="border-t border-line py-[72px] lg:py-[120px]">
        <div className="section-shell">
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

      <ClosingCta
        eyebrow={service.title}
        title={
          <>
            Ready to talk <Hl tone="blue">{service.title.toLowerCase()}</Hl>?
          </>
        }
        lede="Book a free audit call and we'll show you what's worth building first, with a fixed quote to follow."
      />
    </DarkPage>
  );
}
