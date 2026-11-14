import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The homepage's one heading style: a small-caps eyebrow led by a magenta
 * pixel, then a left-aligned, sentence-case H2. Every section uses it, so
 * the page reads as one system rather than a run of individually styled
 * headers.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  as: Tag = "h2",
  id,
  className,
  wideLede = false,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  /** Let the lede run on one line from lg up instead of wrapping at 62ch. */
  wideLede?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p data-reveal="eyebrow" className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-magenta" />
        {eyebrow}
      </p>
      <Tag
        id={id}
        data-reveal="title"
        className="mt-4 text-balance text-[clamp(2rem,1.35rem+2.6vw,3.25rem)] font-bold leading-[1.06] tracking-[-0.025em] text-ink"
      >
        {title}
      </Tag>
      {lede && (
        <p
          data-reveal="lede"
          className={cn(
            "mt-5 max-w-[62ch] text-base leading-relaxed text-ink-soft sm:text-lg",
            wideLede && "lg:max-w-none lg:whitespace-nowrap",
          )}
        >
          {lede}
        </p>
      )}
      {children}
    </div>
  );
}
