import Image from "next/image";

/**
 * Matterpixel pixel-block mark (public/mark.png) — icon-only spots:
 * hero visual, playground reduced-motion fallback. Non-square (5:3),
 * always size with one axis + `w-auto`/`h-auto` on the other.
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
      src="/mark.png"
      alt="Matterpixel mark"
      width={2094}
      height={1256}
      priority={priority}
      className={className}
    />
  );
}
