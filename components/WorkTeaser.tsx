"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PixelResolve } from "@/components/PixelResolve";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { projects } from "@/content/projects";

// Fixed 3 + "view all" arrow card — not a filterable/variable-length grid
// (that's WorkGrid, used on /projects). Always the first 3 in content order,
// which is why nothing here reads a medium-specific field: reorder the file
// and an AI still can land in this row.
const featured = projects.slice(0, 3);

/**
 * A horizontal scroll-snap row, not a grid that wraps to 2 rows on
 * mobile — a wrapping grid's height depends on viewport *width* (2 cols
 * short, 4 cols shorter), so this section's total height varied by
 * device. A single row is always one card tall regardless of viewport,
 * which is what makes "Selected builds" fit comfortably in one screen on
 * any device instead of needing a scroll on narrower ones.
 */
export function WorkTeaser() {
  return (
    <RevealGroup className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:gap-6">
      {featured.map((project) => (
        <RevealItem key={project.slug} className="w-40 shrink-0 snap-start sm:w-56 lg:w-64">
          <Link
            href={`/projects/${project.slug}`}
            className="group hover-lift relative block aspect-square overflow-hidden rounded-[var(--mp-radius-md)] border border-line bg-paper-2"
          >
            <PixelResolve trigger="view" className="absolute inset-0">
              <Image
                src={project.cover}
                alt={project.medium === "website" ? `${project.name} homepage` : `${project.name} — lead frame`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover object-left-top"
              />
            </PixelResolve>

            <div
              className="pointer-events-none absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 sm:p-6"
              style={{
                background: "linear-gradient(to top, rgba(18,18,20,0.92), rgba(18,18,20,0.35) 60%, transparent 100%)",
              }}
            >
              <p className="text-sm font-semibold text-[#f5f3ee]">{project.name}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.08em] text-[#f5f3ee]/70">{project.category}</p>
            </div>
          </Link>
        </RevealItem>
      ))}

      <RevealItem className="w-40 shrink-0 snap-start sm:w-56 lg:w-64">
        <Link
          href="/projects"
          className="group hover-lift relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--mp-radius-md)] border border-blue bg-blue text-paper"
        >
          <ArrowUpRight className="h-8 w-8 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          <span className="text-center text-sm font-semibold">
            View all
            <br />
            projects
          </span>
        </Link>
      </RevealItem>
    </RevealGroup>
  );
}
