import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { WebsiteCaseStudy } from "./WebsiteCaseStudy";
import { MediaCaseStudy } from "./MediaCaseStudy";
import { projects, getProjectBySlug } from "@/content/projects";
import { getServiceBySlug } from "@/content/services";
import { siteUrl } from "@/content/siteConfig";
import { DarkPage } from "@/components/DarkPage";
import { ClosingCta } from "@/components/home/ClosingCta";
import { Hl } from "@/components/home/Hl";

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
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.name} — Matterpixel`,
      description: project.summary,
      url: `${siteUrl}/projects/${project.slug}`,
      type: "article",
      images: [{ url: project.cover }],
    },
  };
}

/**
 * The shell every case study shares: the back link and headline above, the
 * related services, next-project link and closing CTA below. The middle is
 * the medium's own — a shipped site and a generated set have almost no
 * sections in common, and the two bodies live in their own files so neither
 * one is a maze of `project.medium === ...` checks.
 *
 * The branch is also what narrows the union: `WebsiteCaseStudy` takes a
 * `WebsiteProject` and reads `lighthouse`/`liveDemoUrl`/`admin` unguarded,
 * `MediaCaseStudy` takes a `MediaProject` and reads `media`/`specs`.
 * Adding a third medium means a third file here, not another conditional
 * threaded through a 500-line component.
 */
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
    url: `${siteUrl}/projects/${project.slug}`,
    image: `${siteUrl}${project.cover}`,
    creator: { "@type": "Organization", name: "Matterpixel" },
    genre: project.category,
  };

  return (
    /* Published here rather than per-section: the media tiles, the spec
       boxes and the gallery all paint in the project's accent, and this is
       the one node every one of them is under. */
    <DarkPage>
      <div
        style={
          {
            "--accent": project.accent === "magenta" ? "var(--magenta)" : "var(--blue)",
          } as React.CSSProperties
        }
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {project.medium === "website" ? (
          <WebsiteCaseStudy project={project} />
        ) : (
          <MediaCaseStudy project={project} />
        )}

        {/* ── Related services ─────────────────────────────────────────── */}
        {relatedServices.length > 0 && (
          <section className="border-t border-line py-[72px] lg:py-[120px]">
            <div className="section-shell">
              <Reveal>
                <p className="label-eyebrow mb-6">The services behind this build</p>
              </Reveal>
              <RevealGroup className="flex flex-wrap gap-4">
                {relatedServices.map((service) => (
                  <RevealItem key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="btn-outline group"
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

        {/* ── Next project ─────────────────────────────────────────────── */}
        <section className="border-t border-line py-[72px] lg:py-[120px]">
          <div className="section-shell">
            <Reveal>
              <Link href={`/projects/${next.slug}`} className="group block">
                <p className="label-eyebrow">Next build</p>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <h2 className="text-h1 text-ink transition-colors duration-300 group-hover:text-[var(--blue-ink)]">
                      {next.name}
                    </h2>
                    <p className="mt-2 text-sm uppercase tracking-[0.08em] text-ink-soft">
                      {next.category}
                    </p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-ink transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </Link>
            </Reveal>
          </div>
        </section>

        <ClosingCta
          eyebrow="Your brief next"
          title={
            <>
              Want something like this? Let&rsquo;s <Hl tone="blue">build</Hl> it.
            </>
          }
          lede="Same standard, your name on it, scoped against your problem instead of ours."
        />
      </div>
    </DarkPage>
  );
}
