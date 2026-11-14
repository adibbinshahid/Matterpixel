import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The opening of every inner page, in the homepage hero's grammar: the
 * frosted pill eyebrow led by a magenta pixel, a large white headline whose
 * lines rise out of a mask on a short stagger (.hero-line), then the lede
 * and any proof row lifting in after it (.hero-rise). Shorter than the
 * homepage's full-screen poster — an inner page has to reach its content.
 *
 * `lines` are the headline's lines; use <Hl> inside one for the brand-colour
 * keyword, the same way the homepage hero does. `aside` (optional) sits in a
 * second column beside the copy from lg up, and under it on phones.
 */
export function PageHero({
  eyebrow,
  lines,
  lede,
  children,
  aside,
  className,
}: {
  eyebrow: string;
  lines: ReactNode[];
  lede?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  const copy = (
    <div className="flex flex-col items-start">
      <p className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-xl sm:text-xs">
        <span className="h-1.5 w-1.5 bg-magenta" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="mt-6 max-w-[18ch] text-balance text-[clamp(2.25rem,1.3rem+3.4vw,4.5rem)] font-bold leading-[1.04] tracking-[-0.03em] text-white">
        {lines.map((line, i) => (
          <span key={i} className="hero-line block" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
            {line}
          </span>
        ))}
      </h1>
      {lede && (
        <div
          className="hero-rise mt-6 max-w-[60ch] text-base leading-relaxed text-white/75 sm:text-lg"
          style={{ animationDelay: `${0.18 + lines.length * 0.06}s` }}
        >
          {lede}
        </div>
      )}
      {children && (
        <div className="hero-rise mt-8 w-full" style={{ animationDelay: `${0.28 + lines.length * 0.06}s` }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="home-shell pb-14 pt-36 lg:pb-20 lg:pt-44">
        {aside ? (
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
            {copy}
            <div className="hero-rise" style={{ animationDelay: "0.4s" }}>
              {aside}
            </div>
          </div>
        ) : (
          copy
        )}
      </div>
    </section>
  );
}
