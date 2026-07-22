import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { Project } from "@/content/projects";

/**
 * Real screenshot when `project.previewImage` is set; an honest "coming
 * soon" state otherwise — never a fabricated dashboard/UI standing in for
 * a real product (see WorkMockup, which this replaces for Work's own
 * pages — Services' detail page keeps WorkMockup, out of scope here).
 *
 * The second layer (a "why we built it this way" note, pulled straight
 * from the project's own `concept` copy) reveals on hover *or* focus of
 * anything inside the parent's `group` — the card's links below, not just
 * the media itself — so it's reachable by keyboard, not hover-only.
 *
 * `mediaRef` is optional and only used by WorkGrid, which attaches the
 * GSAP parallax tween to the actual image element when one exists.
 */
export function ProjectMedia({
  project,
  mediaRef,
}: {
  project: Project;
  mediaRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--mp-radius-md)] border border-line bg-paper-2">
      {project.previewImage ? (
        <Image
          ref={mediaRef}
          src={project.previewImage}
          alt={`${project.name} preview`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="scale-110 object-cover"
        />
      ) : (
        <div ref={mediaRef} className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <ImageOff className="h-5 w-5 text-ink-soft/50" aria-hidden="true" />
          <p className="label-eyebrow">{project.category}</p>
          <p className="text-sm font-semibold text-ink-soft">Project preview coming soon.</p>
        </div>
      )}

      {/* Hardcoded dark scrim — this is a photo-caption treatment, not a
          themed surface, so it must stay legible over an image (once one
          exists) regardless of what's underneath. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          background: "linear-gradient(to top, rgba(18,18,20,0.92), rgba(18,18,20,0.45) 55%, transparent 100%)",
        }}
      >
        <p className="text-sm leading-relaxed text-[#f5f3ee]">{project.concept}</p>
      </div>
    </div>
  );
}
