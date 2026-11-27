"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { CAL_BRAND_COLOR, CAL_CSS_VARS, CAL_LAYOUT, CAL_NAMESPACE, CAL_THEME } from "@/lib/cal";
import { captureUtm } from "@/lib/utm";
import { guardCalModal } from "@/lib/calModal";

/**
 * Root-layout boot for the contact pathways: saves the landing page's UTM
 * tags, then sets up the Cal.com audit popup once the page has gone idle.
 * Waiting keeps Cal's embed script (and its iframe preload) off the
 * critical path, so it can't cost the page its Lighthouse score. An audit
 * CTA clicked before then loads the embed itself (see CalLink).
 */
export function CalInit() {
  useEffect(() => {
    captureUtm();
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    let cancelled = false;
    const start = () => {
      void initCal().catch(() => {
        // Cal unreachable (blocked, offline): CTAs fall back to their href.
      });
    };
    const onLoad = () => {
      if (!cancelled) handle = idle(start, { timeout: 5000 });
    };
    let handle: number | undefined;
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      if (handle !== undefined) cancelIdle(handle);
    };
  }, []);
  return null;
}

let ready: ReturnType<typeof getCalApi> | null = null;

/** Loads the embed and applies the popup's look. Safe to call repeatedly. */
export function initCal() {
  ready ??= getCalApi({ namespace: CAL_NAMESPACE }).then((cal) => {
    cal("ui", {
      layout: CAL_LAYOUT,
      hideEventTypeDetails: false,
      theme: CAL_THEME,
      cssVarsPerTheme: CAL_CSS_VARS,
      styles: { branding: { brandColor: CAL_BRAND_COLOR } },
    });
    guardCalModal();
    return cal;
  });
  ready.catch(() => {
    ready = null;
  });
  return ready;
}
