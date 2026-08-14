import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import { projects } from "@/content/projects";

const work = projects.filter((p) => p.relatedServiceSlugs.includes("web-app-development"));

/** Compact proof table — one row per build, real metric attached, no
 * decorative panels. Replaces the old alternating full-bleed editorial
 * rows with something that scans in seconds. */
export function SelectedWork() {
  return (
    <section className="panel-dark relative border-t border-line">
      <div className="section-shell py-16 lg:py-20">
        <Reveal>
          <p className="label-eyebrow mb-3" style={{ color: "#fff" }}>
            proof, not promise
          </p>
          <h2 className="max-w-2xl">
            <GiantHeading lines={["What shipped."]} maxFontSize={48} />
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/15">
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-[0.08em] text-white/50">Project</th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-[0.08em] text-white/50">What it is</th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-[0.08em] text-white/50">Result</th>
                <th className="py-3 text-xs font-bold uppercase tracking-[0.08em] text-white/50">
                  <span className="sr-only">Link</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {work.map((project) => (
                <tr key={project.slug}>
                  <td className="py-4 pr-4 align-top">
                    <p className="text-sm font-bold text-white">{project.name}</p>
                    <p className="mt-0.5 text-xs text-white/40">{project.category}</p>
                  </td>
                  <td className="py-4 pr-4 align-top text-sm text-white/70">{project.oneLiner}</td>
                  <td className="py-4 pr-4 align-top">
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                      <span className="font-semibold text-white">{project.highlights[0].value}</span>{" "}
                      {project.highlights[0].label.toLowerCase()}
                    </span>
                  </td>
                  <td className="py-4 align-top">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="group inline-flex items-center gap-1 text-sm font-semibold text-white transition-colors duration-300 hover:text-magenta"
                    >
                      View
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex justify-center">
          <Link href="/projects" className="btn-outline group">
            View all projects
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
