import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PixelResolve } from "@/components/PixelResolve";
import { WorkMockup } from "@/components/WorkMockup";
import { Accordion } from "@/components/ui/Accordion";
import { services, getServiceBySlug } from "@/content/services";
import { projects } from "@/content/projects";
import { siteUrl } from "@/content/siteConfig";

const WHY_MATTERPIXEL = [
  "Senior-led — the person who scopes it is the person who builds it",
  "Performance held to a 90+ mobile PageSpeed floor, not an afterthought",
  "Fixed quotes, agreed before work starts",
  "Every demo build is live and testable, not a screenshot",
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

  const relatedProjects = projects.filter((p) => p.relatedServiceSlugs.includes(slug));

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
          </Reveal>
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="border-t border-line bg-ink px-6 py-20 text-paper sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <Reveal>
              <p className="label-eyebrow mb-6 !text-blue">Demo builds using this service</p>
            </Reveal>
            <RevealGroup className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {relatedProjects.map((project, i) => (
                <RevealItem key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group block transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <PixelResolve trigger="view" className="block">
                      <WorkMockup index={i + 1} accent={project.accent} />
                    </PixelResolve>
                    <h3 className="mt-6 flex items-center gap-2 text-xl font-bold tracking-tight text-paper">
                      {project.name}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </h3>
                    <p className="mt-1 text-sm text-paper/60">{project.category}</p>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

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
