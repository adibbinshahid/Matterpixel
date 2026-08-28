import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Gauge,
  Info,
  KeyRound,
  Smartphone,
} from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PixelResolve } from "@/components/PixelResolve";
import { BrowserFrame, PhoneFrame } from "@/components/BrowserFrame";
import { LighthouseScores } from "@/components/LighthouseScores";
import { projects, getProjectBySlug } from "@/content/projects";
import { getServiceBySlug } from "@/content/services";
import { siteUrl } from "@/content/siteConfig";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

function hostOf(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
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

  const narrative = [
    { label: "The brief", body: project.brief },
    { label: "The problem", body: project.problem },
    { label: "What we built", body: project.solution },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-32 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <Link
              href="/projects"
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink-soft transition-all duration-300 hover:scale-105 hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              All builds
            </Link>

            <p className="label-eyebrow mb-4 mt-8">{project.category}</p>
            <h1 className="max-w-4xl text-display text-ink">{project.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {project.oneLiner}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand group"
              >
                Open the live site
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              {project.admin && (
                <a
                  href={project.admin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-line group"
                >
                  <KeyRound className="h-4 w-4" />
                  Open the admin panel
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-14">
            <PixelResolve trigger="view" className="block rounded-[var(--mp-radius-md)]">
              <BrowserFrame url={hostOf(project.liveDemoUrl)} bodyClassName="aspect-[16/10]">
                <Image
                  src={project.cover}
                  alt={`${project.name} homepage`}
                  fill
                  sizes="(min-width: 1400px) 1400px, 100vw"
                  className="object-cover object-top"
                  priority
                />
              </BrowserFrame>
            </PixelResolve>
          </Reveal>
        </div>
      </section>

      {/* ── Honest framing ───────────────────────────────────────────── */}
      <section className="px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <div className="flex max-w-3xl items-start gap-3 border-l-2 border-blue py-2 pl-5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-ink-soft">
                <span className="font-semibold text-ink">This is a concept build.</span>{" "}
                {project.name} was scoped, designed, and shipped by Matterpixel against a brief we
                set ourselves — there is no client behind it and we don&rsquo;t pretend otherwise.
                Everything described below is live at{" "}
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue underline underline-offset-4"
                >
                  {hostOf(project.liveDemoUrl)}
                </a>{" "}
                and can be clicked through, including the admin panel.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Brief / problem / solution ───────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <RevealGroup className="grid gap-x-12 gap-y-12 lg:grid-cols-3">
            {narrative.map((block, i) => (
              <RevealItem key={block.label}>
                <p className="label-eyebrow">
                  [ {String(i + 1).padStart(2, "0")} ] {block.label}
                </p>
                <p className="mt-5 leading-relaxed text-ink-soft">{block.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Measured performance ─────────────────────────────────────── */}
      <section className="border-y border-line bg-paper-2 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              Measured, not claimed
            </p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">
              We ran the numbers against the live site, and we&rsquo;ll show you the method.
            </h2>
          </Reveal>

          {/* All four categories on one row, in Lighthouse's own ring form
              and against its own 90/50 pass/average/fail bands — a prospect
              who runs the audit themselves should land on the same picture
              they are looking at here. The band colours are the site's
              rather than PageSpeed's; see LighthouseScores for why that
              swap changes the palette and not the reading. The field
              metrics sit beside them as supporting text rather than as two
              more gauges, because a time and a ratio have no 0-100 scale to
              draw an arc against. */}
          <Reveal delay={0.05} className="mt-12">
            <div className="flex flex-col gap-10 rounded-[var(--mp-radius-md)] border border-line bg-paper p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <LighthouseScores scores={project.lighthouse} size="lg" />

              <dl className="flex gap-8 border-line lg:border-l lg:pl-12">
                {project.fieldMetrics.map((m) => (
                  <div key={m.label} className="flex flex-col gap-1">
                    <dd className="text-3xl font-extrabold tracking-tight text-blue">{m.value}</dd>
                    <dt className="text-sm font-semibold text-ink">{m.label}</dt>
                    <span className="text-xs text-ink-soft">{m.note}</span>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {project.metricsMethod}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── What's inside ────────────────────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow">What&rsquo;s inside</p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">
              Every one of these is on the live site. Go and check.
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {project.features.map((f) => (
              <RevealItem key={f.title}>
                <div className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
                  <div>
                    <h3 className="text-h3 text-h3-strong text-ink">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow">Inside the build</p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">Screens from the live site.</h2>
          </Reveal>

          <RevealGroup className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {project.gallery.map((shot) => (
              <RevealItem key={shot.src}>
                <PixelResolve trigger="view" className="block rounded-[var(--mp-radius-md)]">
                  <BrowserFrame
                    url={hostOf(shot.url ?? project.liveDemoUrl)}
                    bodyClassName="aspect-[16/10]"
                  >
                    <Image
                      src={shot.src}
                      alt={shot.caption}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  </BrowserFrame>
                </PixelResolve>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{shot.caption}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Mobile ───────────────────────────────────────────────────── */}
      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="label-eyebrow flex items-center gap-2">
              <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
              On a phone
            </p>
            <h2 className="mt-4 text-h2 text-ink">
              The same build, not a stripped-down version of it.
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-ink-soft">
              This is an unedited capture at 390&nbsp;&times;&nbsp;844 — the iPhone viewport most
              of your traffic will arrive on. Nothing is hidden to make the small screen behave:
              the same navigation, the same actions, the same content, laid out for the hand
              instead of the desk.
            </p>
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105"
            >
              Open it on your own phone
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <PhoneFrame className="w-full max-w-[280px]">
              <Image
                src={project.mobile}
                alt={`${project.name} on a phone`}
                width={780}
                height={1688}
                sizes="280px"
                className="h-auto w-full"
              />
            </PhoneFrame>
          </Reveal>
        </div>
      </section>

      {/* ── Admin panel ──────────────────────────────────────────────── */}
      {project.admin && (
        <section className="panel-dark border-y border-line px-6 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <Reveal>
              <p className="label-eyebrow flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                The owner&rsquo;s side
              </p>
              <h2 className="mt-4 max-w-2xl text-h2 text-ink">
                A site nobody can update is a brochure. Here&rsquo;s the back office.
              </h2>
              <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
                {project.name} ships with a working admin panel, and we&rsquo;re handing you the
                keys rather than describing it. Sign in and change something — {project.admin.note}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href={project.admin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand group"
                >
                  Open the admin panel
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <dl className="flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <dt className="text-ink-soft">user</dt>
                    <dd className="font-semibold text-ink">{project.admin.user}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="text-ink-soft">pass</dt>
                    <dd className="font-semibold text-ink">{project.admin.pass}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="mt-12">
              <BrowserFrame
                url={hostOf(project.admin.url)}
                bodyClassName="aspect-[16/10]"
              >
                <Image
                  src={`/projects/${project.slug}/admin.webp`}
                  alt={`${project.name} admin dashboard`}
                  fill
                  sizes="(min-width: 1400px) 1400px, 100vw"
                  className="object-cover object-top"
                />
              </BrowserFrame>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Build decisions + stack ──────────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-x-16 gap-y-14 lg:grid-cols-3">
          <Reveal className="lg:col-span-1">
            <p className="label-eyebrow">How it was built</p>
            <h2 className="mt-4 text-h2 text-ink">The decisions that made the difference.</h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-block rounded-full border border-line bg-paper-2 px-3.5 py-1.5 text-xs font-semibold text-ink"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Reveal>

          <RevealGroup className="grid gap-10 lg:col-span-2">
            {project.decisions.map((d, i) => (
              <RevealItem key={d.title} className="border-t border-line pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-blue">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-h3 text-h3-strong text-ink">{d.title}</h3>
                    <p className="mt-2 max-w-2xl leading-relaxed text-ink-soft">{d.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Related services ─────────────────────────────────────────── */}
      {relatedServices.length > 0 && (
        <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <Reveal>
              <p className="label-eyebrow mb-6">The services behind this build</p>
            </Reveal>
            <RevealGroup className="flex flex-wrap gap-4">
              {relatedServices.map((service) => (
                <RevealItem key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="hover-lift group inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-5 py-3 text-sm font-semibold text-ink hover:border-blue"
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
      <section className="border-t border-line px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <Link href={`/projects/${next.slug}`} className="group block">
              <p className="label-eyebrow">Next build</p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                <div>
                  <h2 className="text-h1 text-ink transition-colors duration-300 group-hover:text-blue">
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

      {/* ── Closing CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1400px] text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-paper sm:text-5xl">
              Want something like this? Let&rsquo;s build it.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-paper/70">
              Same standard, your name on it — scoped against your problem instead of ours.
            </p>
            <Link href="/contact?tab=booking" className="btn-brand group mt-9">
              Get a Free Audit
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
