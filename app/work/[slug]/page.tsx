import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PixelResolve } from "@/components/PixelResolve";
import { WorkMockup } from "@/components/WorkMockup";
import { projects, getProjectBySlug } from "@/content/projects";
import { getServiceBySlug } from "@/content/services";
import { siteUrl } from "@/content/siteConfig";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.name} — Matterpixel`,
      description: project.summary,
      url: `${siteUrl}/work/${project.slug}`,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const relatedServices = project.relatedServiceSlugs
    .map((s) => getServiceBySlug(s))
    .filter((s): s is NonNullable<typeof s> => !!s);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.summary,
    url: `${siteUrl}/work/${project.slug}`,
    creator: { "@type": "Organization", name: "Matterpixel" },
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
              href="/work"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-all duration-300 hover:scale-105 hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              All builds
            </Link>
            <p className="label-eyebrow mb-4 mt-8">{project.category}</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              {project.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {project.oneLiner}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-6 py-3.5 text-sm font-semibold text-paper transition-transform duration-300 hover:scale-105 animate-gradient-shift"
              >
                Live Demo
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <Link
                href={`/work/${next.slug}`}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-105"
              >
                Next Project: {next.name}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <PixelResolve trigger="view" className="block">
              <WorkMockup index={index + 1} accent={project.accent} />
            </PixelResolve>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-ink">Overview</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{project.summary}</p>
            <p className="mt-4 leading-relaxed text-ink-soft">{project.concept}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-2xl font-bold tracking-tight text-ink">The Approach</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{project.approach}</p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line bg-paper-2 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-6">Tech stack</p>
          </Reveal>
          <RevealGroup className="flex flex-wrap gap-3">
            {project.techStack.map((tech) => (
              <RevealItem key={tech}>
                <span className="inline-block border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink">
                  {tech}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1} className="mt-16">
            <p className="label-eyebrow mb-6">Highlights</p>
          </Reveal>
          <RevealGroup className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {project.highlights.map((h) => (
              <RevealItem key={h.label} className="flex flex-col gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-blue">{h.value}</span>
                <span className="text-sm text-ink-soft">{h.label}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-6">Gallery</p>
          </Reveal>
          <RevealGroup className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <RevealItem>
              <PixelResolve trigger="view" className="block">
                <WorkMockup index={index + 2} accent={project.accent} />
              </PixelResolve>
            </RevealItem>
            <RevealItem>
              <PixelResolve trigger="view" className="block">
                <WorkMockup
                  index={index + 3}
                  accent={project.accent === "blue" ? "magenta" : "blue"}
                />
              </PixelResolve>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <Reveal>
              <p className="label-eyebrow mb-6">Built with these services</p>
            </Reveal>
            <RevealGroup className="flex flex-wrap gap-4">
              {relatedServices.map((service) => (
                <RevealItem key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group inline-flex items-center gap-2 border border-line bg-paper-2 px-5 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:scale-105 hover:border-blue"
                  >
                    {service.title}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              Want something like this? Let&rsquo;s build it.
            </h2>
            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[length:200%_100%] bg-gradient-to-r from-blue via-magenta to-blue px-7 py-4 text-sm font-semibold text-paper transition-transform duration-300 hover:scale-105 animate-gradient-shift"
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
