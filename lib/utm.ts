"use client";

import type { Utm } from "@/lib/schema";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Session copy of the tags the visitor landed with, so a quote sent three
 * pages later still credits the campaign that brought them in. */
const STORAGE_KEY = "mp:utm";

function fromSearch(search: string): Utm {
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim().slice(0, 200);
    if (value) utm[key] = value;
  }
  return utm;
}

/** Saves the current URL's UTM tags, if it has any. Called once per page
 * load from the root layout. */
export function captureUtm(): void {
  try {
    const utm = fromSearch(window.location.search);
    if (Object.keys(utm).length) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // Storage blocked (private mode, quota). Tags on the current URL still work.
  }
}

/** The current URL's tags, or the ones saved earlier in this session. */
export function readUtm(): Utm {
  if (typeof window === "undefined") return {};
  const current = fromSearch(window.location.search);
  if (Object.keys(current).length) return current;
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as Utm | null;
    return saved && typeof saved === "object" ? fromSearch(new URLSearchParams(saved as Record<string, string>).toString()) : {};
  } catch {
    return {};
  }
}
