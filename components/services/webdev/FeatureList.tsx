import { Check } from "lucide-react";
import { GiantHeading } from "@/components/GiantHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import type { Service } from "@/content/services";

type Group = { label: string; items: string[] };

function buildGroups(service: Service): Group[] {
  return [
    { label: "What you get", items: service.deliverables },
    { label: "What we build", items: service.capabilities ?? [] },
    { label: "Performance & integrations", items: [...(service.performance ?? []), ...(service.integrations ?? [])] },
    { label: "Deployment & support", items: [...(service.deployment ?? []), ...(service.ongoingSupport ?? [])] },
  ].filter((g) => g.items.length > 0);
}

/**
 * Static feature checklist grid — replaces the old hover-driven capability
 * map with a plain, scannable list a visitor can read top to bottom without
 * touching anything.
 */
export function FeatureList({ service }: { service: Service }) {
  const groups = buildGroups(service);

  return (
    <section className="panel-dark relative border-t border-line">
      <div className="section-shell py-16 lg:py-20">
        <Reveal>
          <p className="label-eyebrow mb-3" style={{ color: "#fff" }}>
            what&rsquo;s included
          </p>
          <h2 className="max-w-2xl">
            <GiantHeading lines={["Every build, itemized."]} maxFontSize={48} />
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
          {groups.map((group) => (
            <RevealItem key={group.label}>
              <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-white/50">{group.label}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
