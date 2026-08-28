import Image from "next/image";

/**
 * Matterpixel mark (public/mark.svg) — the two inward-facing brand wedges,
 * for icon-only spots: hero visual, playground reduced-motion fallback.
 * Non-square (3:2), always size with one axis + `w-auto`/`h-auto` on the
 * other. Vector, so it stays crisp at any size.
 */
export function MarkImg({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/mark.svg"
      alt="Matterpixel mark"
      width={300}
      height={200}
      priority={priority}
      className={className}
    />
  );
}
