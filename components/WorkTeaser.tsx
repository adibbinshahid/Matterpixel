"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ImageOff } from "lucide-react";
import { PixelResolve } from "@/components/PixelResolve";
import { RevealGroup, RevealItem } from "@/components/Reveal";
import { projects } from "@/content/projects";

// Fixed 3 + "view all" arrow card — not a filterable/variable-length grid
// (that's WorkGrid, used on /projects). Always the first 3 in content order.
const featured = projects.slice(0, 3);

export function WorkTeaser() {
  return (
    <RevealGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {featured.map((project) => (
        <RevealItem key={project.slug}>
          <Link
            href={`/projects/${project.slug}`}
            className="group hover-lift relative block aspect-square overflow-hidden rounded-[var(--mp-radius-md)] border border-line bg-paper-2"
          >
            <PixelResolve trigger="view" className="absolute inset-0">
              {project.previewImage ? (
                <Image
                  src={project.previewImage}
                  alt={`${project.name} preview`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="scale-110 object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                  <ImageOff className="h-5 w-5 text-ink-soft/50" aria-hidden="true" />
                  <p className="label-eyebrow">{project.category}</p>
                </div>
              )}
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

      <RevealItem>
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
