import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { PixelResolve } from "@/components/PixelResolve";
import { process } from "@/content/siteConfig";

function StepGlyph({ index }: { index: number }) {
  const cells = Array.from({ length: 16 }, (_, i) => i);
  return (
    <div className="grid h-14 w-14 grid-cols-4 grid-rows-4 gap-0.5">
      {cells.map((i) => {
        const active = (i + index * 3) % 5 !== 0;
        return (
          <div
            key={i}
            style={{
              background: active
                ? i % 2 === 0
                  ? "var(--blue)"
                  : "var(--magenta)"
                : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

export function Process() {
  return (
    <section id="process" className="border-t border-line px-6 py-28 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label-eyebrow mb-4">{process.eyebrow}</p>
          <h2 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            {process.heading}
          </h2>
        </Reveal>

        <RevealGroup
          stagger={0.15}
          className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0"
        >
          {process.steps.map((step, i) => (
            <RevealItem
              key={step.id}
              className={`relative lg:px-8 ${
                i > 0 ? "lg:border-l lg:border-line" : ""
              }`}
            >
              <span className="label-eyebrow">[ {step.id} ]</span>
              <PixelResolve trigger="view" delay={i * 0.1} cell={8} className="mt-5 h-14 w-14">
                <StepGlyph index={i} />
              </PixelResolve>
              <h3 className="mt-6 text-xl font-bold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
