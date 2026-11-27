import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { problemPackages } from "@/content/packages";
import { getProjectBySlug, isWebsiteProject } from "@/content/projects";
import { ProblemPicker, type ResolvedProof } from "@/components/services/ProblemPicker";
import { StackBuilder } from "@/components/services/StackBuilder";
import { CustomQuote } from "@/components/services/CustomQuote";
import { Aurora } from "@/components/home/Aurora";

/**
 * Resolves each package's proof card on the server: a project's name,
 * cover and measured Lighthouse score. content/projects.ts is far too large
 * to ship to the client for four values, so only these plain props cross
 * into the interactive picker.
 */
export function getPackageProofs(): Record<string, ResolvedProof> {
  const proofs: Record<string, ResolvedProof> = {};
  for (const pkg of problemPackages) {
    if (!pkg.proof) continue;
    const project = getProjectBySlug(pkg.proof.projectSlug);
    if (!project) continue;
    proofs[pkg.slug] = {
      href: `/projects/${project.slug}`,
      name: pkg.proof.label ?? project.name,
      cover: project.cover,
      metric: isWebsiteProject(project)
        ? { value: String(project.lighthouse.performance), label: "Lighthouse performance" }
        : { value: String(project.media.length), label: "finished stills" },
    };
  }
  return proofs;
}

/**
 * The service finder as one block — problem picker → build-your-own stack
 * → custom brief — at the top of /services. The homepage composes the same
 * parts individually, with its own sections between them.
 */
export function ServiceFinder({ firstSection = false }: { firstSection?: boolean }) {
  return (
    <section id="service-finder" aria-label="Find the right service" className="home">
      <div
        data-nav-scrim="light"
        className={`relative ${firstSection ? "pt-32 sm:pt-36" : "pt-[72px] lg:pt-[120px]"} pb-[72px] lg:pb-[120px]`}
      >
        <ProblemPicker packages={problemPackages} proofs={getPackageProofs()} firstSection={firstSection} />
      </div>

      {/* overflow-clip, not -hidden: it trims the Aurora the same way but
          isn't a scroll container, so the stack summary's position: sticky
          still pins to the viewport. */}
      <div data-nav-light="" className="home-light home-section relative isolate overflow-clip">
        <Aurora />
        <div className="home-shell">
          <StackBuilder />
          <CustomQuote />

          <div className="mt-12 flex justify-center">
            <Link
              href="/services#capabilities"
              className="group inline-flex min-h-11 items-center gap-1.5 text-base font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              See all capabilities
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
