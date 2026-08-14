import { GiantHeading } from "@/components/GiantHeading";
import { Reveal } from "@/components/Reveal";
import type { Service } from "@/content/services";

function shortLabel(item: string) {
  return item.split(" (")[0];
}

/** Plain badge list — same data TechEcosystem's radial diagram used to
 * visualize, now just laid flat so it reads in one pass. */
export function TechStack({ service }: { service: Service }) {
  const integrations = (service.integrations ?? []).map(shortLabel);
  const performance = service.performance ?? [];
  const deployment = service.deployment ?? [];

  return (
    <section className="border-t border-line px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label-eyebrow mb-3">the stack</p>
          <h2 className="max-w-2xl">
            <GiantHeading lines={["Built on Next.js / React."]} maxFontSize={44} />
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 flex flex-col gap-6">
          {!!integrations.length && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">Integrations</p>
              <div className="flex flex-wrap gap-2">
                {integrations.map((i) => (
                  <span key={i} className="rounded-full border border-line bg-paper-2 px-3 py-1.5 text-xs text-ink">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!!performance.length && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">Performance</p>
              <div className="flex flex-wrap gap-2">
                {performance.map((i) => (
                  <span key={i} className="rounded-full border border-line bg-paper-2 px-3 py-1.5 text-xs text-ink">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!!deployment.length && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">Deployment</p>
              <div className="flex flex-wrap gap-2">
                {deployment.map((i) => (
                  <span key={i} className="rounded-full border border-line bg-paper-2 px-3 py-1.5 text-xs text-ink">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
