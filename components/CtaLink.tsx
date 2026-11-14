"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ctas, ctaHref, type CtaKind } from "@/content/siteConfig";
import { cn } from "@/lib/utils";

/** A section's secondary action: a plain underlined link, never a pill, so
 * it can't compete with the primary beside it. Colour comes from the
 * surrounding text; the underline is that same colour, dimmed. */
export const TEXT_LINK =
  "inline-flex min-h-11 items-center text-base font-semibold underline underline-offset-4 [text-decoration-color:color-mix(in_srgb,currentColor_40%,transparent)] transition-colors hover:decoration-magenta";

/**
 * Every conversion CTA on the site renders through this, so label and href
 * always come from `ctas` in siteConfig. `primary` is the pill
 * (`className` carries any per-surface modifier such as `btn-on-magenta`);
 * `text` is the secondary text link.
 */
export function CtaLink({
  cta,
  variant = "primary",
  label,
  params,
  className,
  ...rest
}: {
  cta: CtaKind;
  variant?: "primary" | "text";
  /** Overrides the default label — only ever with another `ctas` string. */
  label?: string;
  /** Extra query params (package, stack, details). */
  params?: Record<string, string | undefined>;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const href = ctaHref(cta, params);
  const text = label ?? ctas[cta].label;

  if (variant === "text") {
    return (
      <Link href={href} className={cn(TEXT_LINK, className)} {...rest}>
        {text}
      </Link>
    );
  }

  return (
    <Link href={href} className={cn("btn-brand group", className)} {...rest}>
      {text}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
