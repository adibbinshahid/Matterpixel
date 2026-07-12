"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PixelResolve } from "@/components/PixelResolve";
import { WorkMockup } from "@/components/WorkMockup";
import { projects, type Project } from "@/content/projects";
import { EASE } from "@/lib/utils";

function tagOf(project: Project) {
  return project.category.split("·")[1]?.trim() ?? project.category;
}

export function WorkGrid() {
  const tags = ["All", ...Array.from(new Set(projects.map(tagOf)))];
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? projects : projects.filter((p) => tagOf(p) === active);

  return (
    <div>
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filter builds by category">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            role="tab"
            aria-selected={active === tag}
            onClick={() => setActive(tag)}
            className={`font-avenir rounded-full border px-4 py-2 text-sm transition-all duration-300 hover:scale-105 ${
              active === tag
                ? "border-blue bg-blue text-paper"
                : "border-line bg-paper text-ink-soft hover:border-blue hover:text-ink"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => (
            <motion.article
              key={project.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={i === 0 ? "lg:col-span-2" : ""}
            >
              <div className="border border-line bg-paper-2 p-6 transition-colors duration-300 hover:border-blue sm:p-8">
                <PixelResolve trigger="view" className="block">
                  <WorkMockup index={i + 1} accent={project.accent} />
                </PixelResolve>

                <div className="mt-10">
                  <span className="label-eyebrow">[ {String(i + 1).padStart(2, "0")} ]</span>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {project.name}
                  </h2>
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
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-105"
                    >
                      View Case Study
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-blue transition-transform duration-300 hover:scale-105"
                    >
                      Live Demo
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
