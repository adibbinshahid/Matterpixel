import Link from "next/link";
import { ArrowUpRight, Info, Layers, Sparkles, Wand2 } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { MediaGallery, MediaTile } from "@/components/ProjectMedia";
import type { MediaProject } from "@/content/projects";

/**
 * The case study for generated work.
 *
 * It is deliberately the same page as WebsiteCaseStudy in shape — headline,
 * honest framing, brief/problem/solution, a proof band, what was delivered,
 * the set itself, the decisions — because a prospect comparing a film to a
 * storefront should be reading the same document twice, not two different
 * kinds of marketing.
 *
 * What it cannot borrow is the proof. A website's band is a Lighthouse row
 * the visitor can re-run; there is no equivalent audit for a still. So the
 * band here states three things that are checkable in a different way —
 * what the piece was made FROM, what MADE it, and what was actually
 * DELIVERED — which is honesty rules 6-8 rendered. It is a weaker claim
 * than a reproducible score and it should look like one: no gauges, no
 * ring, no borrowed authority.
 */
export function MediaCaseStudy({ project }: { project: MediaProject }) {
  const lead = project.media[0];
  const isFilm = project.medium === "ai-video";

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow mb-4 mt-8">{project.category}</p>
            <h1 className="max-w-4xl text-display text-ink">{project.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">
              {project.oneLiner}
            </p>

            {/* The only outbound link a media piece has. A generated set has
                no URL of its own to open, so where it was made for one of
                our own builds, that build is the nearest thing to a "go and
                check" — and it is a real one: the imagery is in use there. */}
            {project.madeFor && (
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link href={project.madeFor.href} className="btn-brand group">
                  {project.madeFor.label}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            )}
          </Reveal>

          {/* The lead piece plays as soon as it is on screen — `eager`. This
              is the one asset on the page that is allowed to: it is the
              hero, it is the reason the visitor opened the page, and there
              is nothing else moving beside it to compete with. Every other
              clip in the set waits to be asked. */}
          <Reveal delay={0.1} className="mt-14">
            <MediaTile
              asset={lead}
              eager
              priority
              sizes="(min-width: 1400px) 1400px, 100vw"
              className="mx-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">{lead.caption}</p>
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
                <span className="font-semibold text-ink">This is a concept piece.</span>{" "}
                {project.name} was briefed, produced, and finished by Matterpixel against a brief
                we set ourselves — there is no client behind it and we don&rsquo;t pretend
                otherwise. It is generated work, and we say so on the piece rather than in a
                footnote: {project.sourceNote}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Brief / problem / solution ───────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <RevealGroup className="grid gap-x-12 gap-y-12 lg:grid-cols-3">
            {[
              { label: "The brief", body: project.brief },
              { label: "The problem", body: project.problem },
              { label: "How it was made", body: project.solution },
            ].map((block, i) => (
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

      {/* ── What was delivered ───────────────────────────────────────── */}
      <section className="border-y border-line bg-paper-2 px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow flex items-center gap-2">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Delivered, not quoted
            </p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">
              The counts are what went out the door, and the toolchain is named.
            </h2>
          </Reveal>

          {/* Numbers on the left, the tools that produced them on the right,
              split by the same rule the Lighthouse band uses — so the two
              case studies put their proof in the same place on the page even
              though the proof itself is a different kind of thing. */}
          <Reveal delay={0.05} className="mt-12">
            <div className="flex flex-col gap-10 rounded-[var(--mp-radius-md)] border border-line bg-paper p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <dl className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 lg:gap-x-12">
                {project.specs.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <dd className="text-3xl font-extrabold tracking-tight text-blue">{s.value}</dd>
                    <dt className="text-sm font-semibold text-ink">{s.label}</dt>
                  </div>
                ))}
              </dl>

              <div className="border-line lg:border-l lg:pl-12">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Wand2 className="h-3.5 w-3.5 text-blue" aria-hidden="true" />
                  Toolchain
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.toolchain.map((tool) => (
                    <span
                      key={tool}
                      className="inline-block rounded-full border border-line bg-paper-2 px-3.5 py-1.5 text-xs font-semibold text-ink"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {project.sourceNote}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── What's in the set ────────────────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow">What&rsquo;s in the set</p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">
              {isFilm
                ? "One film, and every cut a launch actually needs."
                : "Every crop the site asks for, from one product form."}
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {project.deliverables.map((d) => (
              <RevealItem key={d.title}>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
                  <div>
                    <h3 className="text-h3 text-h3-strong text-ink">{d.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{d.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── The set ──────────────────────────────────────────────────── */}
      <section className="border-t border-line px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow">The set</p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">
              {isFilm ? "Every cut, at its delivered ratio." : "Every frame, uncropped."}
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
              Nothing here is re-framed to make the grid tidy — a 9:16 cutdown is shown at 9:16.
              Open any one of them full-size.
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-12">
            <MediaGallery items={project.media} />
          </Reveal>
        </div>
      </section>

      {/* ── Production decisions ─────────────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1400px] gap-x-16 gap-y-14 lg:grid-cols-3">
          <Reveal className="lg:col-span-1">
            <p className="label-eyebrow">How it was produced</p>
            <h2 className="mt-4 text-h2 text-ink">
              The decisions that made the difference.
            </h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Generation is the cheap part. What separates a set that ships from a folder of
              near-misses is everything decided before the first prompt runs.
            </p>
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
    </>
  );
}
