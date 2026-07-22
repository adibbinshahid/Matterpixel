"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PixelResolve } from "@/components/PixelResolve";
import { ProjectMedia } from "@/components/ProjectMedia";
import { projects, type Project } from "@/content/projects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DURATIONS, EASE } from "@/lib/utils";

function tagOf(project: Project) {
  return project.category.split("·")[1]?.trim() ?? project.category;
}

// Center-of-viewport trigger: shrinks the effective viewport to a thin band
// around vertical center (Motion Bible: Work items reveal individually as
// they near screen-center, not as soon as their edge appears).
const CENTER_VIEWPORT = { once: true, margin: "-45% 0px -45% 0px" };

/**
 * `limit`: caps how many projects render and hides the category-filter
 * row — used for the homepage's curated "Selected work" teaser. Omit for
 * the full filterable grid (see app/projects/page.tsx).
 */
export function WorkGrid({ limit }: { limit?: number } = {}) {
  const reduced = useReducedMotion();
  const tags = ["All", ...Array.from(new Set(projects.map(tagOf)))];
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter((p) => tagOf(p) === active);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  // GSAP ScrollTrigger parallax — the Motion Bible's one sanctioned
  // scroll-scrubbed effect for Work. Only meaningful once a project has a
  // real `previewImage`; today that's none, so this is a verified no-op,
  // wired and ready rather than parallaxing placeholder text.
  const mediaEls = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (reduced) return;
    const triggers: ScrollTrigger[] = [];
    for (const project of visible) {
      if (!project.previewImage) continue;
      const el = mediaEls.current.get(project.slug);
      if (!el) continue;
      const tween = gsap.fromTo(
        el,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }
    ScrollTrigger.refresh();
    return () => {
      triggers.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, visible.map((p) => p.slug).join(",")]);

  return (
    <div>
      {!limit && (
        <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter builds by category">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={active === tag}
              onClick={() => setActive(tag)}
              className={`hover-lift font-avenir rounded-full border px-4 py-2 text-sm ${
                active === tag
                  ? "border-blue bg-blue text-paper"
                  : "border-line bg-paper text-ink-soft hover:border-blue hover:text-ink"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <motion.div layout className={`grid grid-cols-1 gap-8 md:grid-cols-2 ${limit ? "" : "mt-12"}`}>
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <motion.article
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={CENTER_VIEWPORT}
              transition={{ duration: DURATIONS.standard, ease: EASE }}
              exit={{ opacity: 0, y: -12 }}
              className={i === 0 ? "md:col-span-2" : ""}
            >
              <div className="group card">
                <PixelResolve trigger="view" className="block">
                  <ProjectMedia
                    project={project}
                    mediaRef={(el) => {
                      if (el) mediaEls.current.set(project.slug, el);
                      else mediaEls.current.delete(project.slug);
                    }}
                  />
                </PixelResolve>

                <div className="mt-10">
                  <span className="label-eyebrow">[ {String(i + 1).padStart(2, "0")} ]</span>
                  <h3 className="mt-2 text-h3 text-ink">{project.name}</h3>
                  <p className="mt-1 text-sm uppercase tracking-[0.08em] text-ink-soft">
                    {project.category}
                  </p>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-soft">
                    {project.oneLiner}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.highlights.map((h) => (
                      <span
                        key={h.label}
                        className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft"
                      >
                        {h.label}: <span className="text-blue">{h.value}</span>
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="group/link inline-flex items-center gap-2 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-105"
                    >
                      View Case Study
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-flex items-center gap-2 text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105"
                    >
                      Live Demo
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
