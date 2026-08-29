import Link from "next/link";
import { ArrowUpRight, Info, Layers, Sparkles } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { MediaGallery } from "@/components/ProjectMedia";
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
 * band here states two things instead — what the piece was made FROM, and
 * what was actually DELIVERED — which is honesty rules 6 and 8 rendered.
 * What MADE it is deliberately absent: a model name is not checkable by a
 * visitor either, and naming one invites them to grade the vendor rather
 * than the work. It is a weaker claim than a reproducible score and it
 * should look like one: no gauges, no ring, no borrowed authority.
 */
export function MediaCaseStudy({ project }: { project: MediaProject }) {
  /* There is no hero frame. A media case study used to open on one asset at
     full width, which cost a screen and a half before the visitor saw the
     second piece — and the second piece is the point: the claim is a SET of
     fifteen, not one good still. The contact sheet now runs directly under
     the title, so the whole set is the hero and every frame is one click
     from full size. */
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

      {/* ── The set ──────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 pt-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <p className="label-eyebrow">The set</p>
            <h2 className="mt-4 max-w-2xl text-h2 text-ink">
              All {project.media.length}, on one sheet.
            </h2>
            {/* The thumbnails crop; the pieces do not. Saying which is which
                is the whole reason this line exists — a squared contact sheet
                would otherwise read as a set that was re-framed to fit. */}
            <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
              {isFilm
                ? "Every clip in the set, squared down to a contact sheet so none of them gets missed. Click any frame to play it full-size at its delivered ratio — a 9:16 cutdown opens at 9:16."
                : "Every frame in the set, squared down to a contact sheet so none of them gets missed. Click any one to open it full-size and uncropped — nothing is re-framed in the view itself, and you can step through the whole set from there."}
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-10">
            <MediaGallery items={project.media} />
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
              The counts are what went out the door, not what a rate card promises.
            </h2>
          </Reveal>

          {/* Four counts, full width. There was a toolchain column here; the
              models are no longer named anywhere on the site, and a column
              reading "in-house pipeline" would only tell a visitor a name
              was being withheld. What the set was made FROM and what came
              out of it carry the honesty claim on their own. */}
          <Reveal delay={0.05} className="mt-12">
            <div className="rounded-[var(--mp-radius-md)] border border-line bg-paper p-6 sm:p-8">
              <dl className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 lg:gap-x-12">
                {project.specs.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    {/* 2xl rather than 3xl: three of the four values here are
                        short numbers, but "up to 4K" and a multi-ratio row
                        are not, and at 3xl those wrapped mid-token in a
                        four-column band. */}
                    <dd className="text-2xl font-extrabold leading-tight tracking-tight text-blue">
                      {s.value}
                    </dd>
                    <dt className="text-sm font-semibold text-ink">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {project.sourceNote}
            </p>
            {/* The resolution above is the master's, not this page's. Every
                image on the site is capped at 1600px on the long edge and
                never upscaled, so a set listed at 4K opens here as a web
                copy — worth saying plainly rather than letting a visitor
                find the gap and read it as a stretched number. */}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">
              Resolution is the delivered master. The copies on this page are web exports capped at
              1600px on the long edge, never upscaled &mdash; so a set listed above its cap looks
              smaller here than what a client receives.
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
              {isFilm ? "What the reel actually has to do." : "What the set actually has to do."}
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
