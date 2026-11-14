"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ctaHref, ctas } from "@/content/siteConfig";
import { CtaLink } from "@/components/CtaLink";

const MIN = 10;
const MAX = 2000;

/**
 * Part 3: the off-menu brief. The existing contact handler needs a name,
 * an email and a few scoping answers before it will accept an inquiry, so
 * this doesn't post on its own — it hands the description to the inquiry
 * wizard on /contact (`?details=`), which pre-fills it as the project
 * details and submits through that same handler.
 */
export function CustomQuote() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (value.length < MIN) {
      setError("A sentence or two helps us quote it properly.");
      return;
    }
    router.push(ctaHref("quote", { details: value }));
  };

  return (
    <div data-reveal="block" className="mt-16 sm:mt-20">
      <form
        onSubmit={onSubmit}
        noValidate
        className="panel-dark relative overflow-hidden rounded-[28px] p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_1.3fr] lg:gap-12 lg:p-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-magenta/25 blur-3xl"
        />
        <div className="relative">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-magenta" />
            Custom
          </p>
          <h2 className="mt-4 text-balance text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ink">
            Something else? ERP, internal tools, anything.
          </h2>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 lg:mt-0">
          <label htmlFor="custom-brief" className="text-sm font-semibold text-ink">
            Describe what you need
          </label>
          <textarea
            id="custom-brief"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            maxLength={MAX}
            rows={4}
            aria-invalid={!!error}
            aria-describedby={error ? "custom-brief-error" : undefined}
            placeholder="e.g. A stock and invoicing tool for our three shops, synced with our accounts."
            className="w-full resize-y rounded-2xl border border-line bg-white/[0.04] px-4 py-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/40"
          />
          {error && (
            <p id="custom-brief-error" role="alert" className="text-sm text-magenta">
              {error}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="submit" className="btn-brand group w-fit">
              {ctas.quote.label}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <CtaLink cta="book" variant="text" className="text-ink" />
          </div>
        </div>
      </form>
    </div>
  );
}
