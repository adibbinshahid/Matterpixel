import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Pixels in the corner meter — they light one by one on hover. */
const PIXELS = 6;

/**
 * One post card, shared by /insights and the related row under a post.
 * Hover is authored in the site's pixel language rather than a scale bump:
 * the blue→magenta seam draws across the top edge, the corner meter fills
 * pixel by pixel, the title shifts to blue and the arrow travels. All CSS
 * (.insight-card in globals.css), stilled under reduced motion.
 */
export function InsightCard({
  slug,
  tag,
  title,
  excerpt,
  meta,
}: {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  meta?: string;
}) {
  return (
    <Link
      href={`/insights/${slug}`}
      className="insight-card group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-line bg-paper-2 p-7 sm:p-8"
    >
      <span aria-hidden="true" className="insight-card-seam" />
      <span aria-hidden="true" className="insight-card-meter">
        {Array.from({ length: PIXELS }, (_, i) => (
          <span key={i} style={{ transitionDelay: `${i * 45}ms` }} />
        ))}
      </span>
      <div>
        <span className="label-eyebrow">{tag}</span>
        <h3 className="mt-4 text-xl font-bold leading-snug tracking-tight text-ink transition-colors duration-300 group-hover:text-[var(--blue-ink)]">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{excerpt}</p>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-4 text-xs text-ink-soft">
        <span>{meta}</span>
        <ArrowRight className="h-4 w-4 text-[var(--blue-ink)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5" />
      </div>
    </Link>
  );
}
