"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CalLink } from "@/components/CalLink";
import { ctas, ctaHref, type CtaKind } from "@/content/siteConfig";
import { sourceFor, trackEvent } from "@/lib/analytics";
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
 * `text` is the secondary text link; `inline` is a link inside running
 * copy, styled entirely by `className`.
 *
 * `book` opens the Cal.com audit popup (a real cal.com link underneath);
 * `quote` goes to the /contact form.
 *
 * `section` names where the CTA sits. With the page it becomes the link's
 * `src` (e.g. `services-stack`), which the contact hub carries through to
 * the email, and the `cta_click` event's source.
 */
export function CtaLink({
  cta,
  section,
  variant = "primary",
  label,
  params,
  className,
  onClick,
  ...rest
}: {
  cta: CtaKind;
  section: string;
  variant?: "primary" | "text" | "inline";
  /** Overrides the default label — only ever with another `ctas` string. */
  label?: string;
  /** Extra query params (package, stack, details). */
  params?: Record<string, string | undefined>;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const src = sourceFor(usePathname(), section);
  const href = ctaHref(cta, { ...params, src });
  const text = label ?? ctas[cta].label;
  const handleClick: ComponentProps<typeof Link>["onClick"] = (e) => {
    onClick?.(e);
    if (!e.defaultPrevented) trackEvent("cta_click", { cta, src });
  };

  const classes = cn(variant === "primary" ? "btn-brand group" : variant === "text" && TEXT_LINK, className);
  const content = (
    <>
      {text}
      {variant === "primary" && (
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </>
  );

  if (cta === "book") {
    // Drop next/link's routing props; the rest are plain anchor attributes.
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const { prefetch, replace, scroll, shallow, passHref, legacyBehavior, locale, onNavigate, ...anchorProps } = rest;
    /* eslint-enable @typescript-eslint/no-unused-vars */
    return (
      <CalLink onClick={handleClick} className={classes} {...(anchorProps as ComponentProps<"a">)}>
        {content}
      </CalLink>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={classes} {...rest}>
      {content}
    </Link>
  );
}

/** An external link (WhatsApp, mailto) that reports which channel was
 * picked. For server components that can't attach a click handler. */
export function PartnerLink({
  channel,
  ...rest
}: { channel: "whatsapp" | "email" } & ComponentProps<"a">) {
  return <a {...rest} onClick={() => trackEvent("partner_click", { channel })} />;
}
