"use client";

import { useEffect, useState, type ComponentProps, type MouseEvent } from "react";
import { initCal } from "@/components/CalInit";
import { CAL_LINK, CAL_NAMESPACE, calBookingUrl, calConfig } from "@/lib/cal";
import { readUtm } from "@/lib/utm";
import type { Utm } from "@/lib/schema";

type CalWindow = Window & {
  Cal?: { ns?: Record<string, { instance?: unknown } | undefined> };
};

/** True once Cal's embed script has run and set up our namespace. From then
 * on, its own document-level click listener opens the popup for any
 * `data-cal-link` element. */
function embedHandlesClicks(): boolean {
  return !!(window as CalWindow).Cal?.ns?.[CAL_NAMESPACE]?.instance;
}

/**
 * Every "Book a free audit call" CTA. A real link to the cal.com booking
 * page (new tab), so it works with JavaScript off, or before Cal's embed
 * has loaded. Once the embed is running it opens the Cal.com popup instead. UTM tags from the visit ride along as
 * booking metadata.
 */
export function CalLink({
  onClick,
  children,
  ...rest
}: Omit<ComponentProps<"a">, "href" | "target" | "rel">) {
  // Read after mount: the server has no URL search or session storage, and
  // reading during render would make the markup differ at hydration.
  const [utm, setUtm] = useState<Utm>({});
  useEffect(() => setUtm(readUtm()), []);
  const href = calBookingUrl(utm);
  const config = calConfig(utm);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    // Cmd/Ctrl/Shift-click and middle-click keep their usual meaning.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!embedHandlesClicks()) {
      // Embed not running yet (slow network, blocked, still idle-waiting):
      // let the link open the booking page in a new tab so the click is
      // never dead, and start loading the popup for the next click.
      void initCal().catch(() => {});
      return;
    }
    // Cal's listener opens the popup but leaves the link's own navigation
    // alone, so without this the booking page would also open in a tab.
    e.preventDefault();
  };

  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noopener"
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config={JSON.stringify(config)}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
