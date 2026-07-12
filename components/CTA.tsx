import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { cta, contactReassurance, bookingUrl } from "@/content/siteConfig";

export function CTA() {
  return (
    <section className="px-6 pb-28 pt-40 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h1 className="max-w-3xl text-[clamp(2.25rem,6vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
            {cta.heading}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div id="email" className="mt-6 flex scroll-mt-32 flex-wrap gap-x-10 gap-y-2 text-ink-soft">
            <a
              href={`mailto:${cta.email}`}
              className="inline-block w-fit origin-left underline-offset-4 transition-transform duration-300 hover:scale-105 hover:underline"
            >
              {cta.email}
            </a>
            <span>{cta.location}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {contactReassurance.map((r) => (
              <span key={r} className="text-sm font-semibold text-ink-soft">
                {r}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.7fr]">
          <div className="border border-line bg-paper p-8 sm:p-10">
            <h2 className="text-lg font-bold tracking-tight text-ink">Start a project</h2>
            <p className="mt-1 text-sm text-ink-soft">Tell us what you&rsquo;re building — we reply within 24h.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 border border-line bg-paper-2 p-8 sm:p-10">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                Prefer to talk first?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Book a free 15-minute intro call — no pitch deck, just a real
                conversation about what you need.
              </p>
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-avenir group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm text-paper transition-all duration-300 hover:scale-105 hover:bg-blue"
            >
              Book a 15-min call
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
