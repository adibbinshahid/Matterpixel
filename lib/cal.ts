import type { Utm } from "@/lib/schema";

/** Cal.com embed namespace for the free audit call. Every audit CTA and the
 * root-layout init use this one name. */
export const CAL_NAMESPACE = "audit";

/** `username/event` on cal.com. */
export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK || "matterpixel/audit";

/** The brand's primary colour (`--blue` in app/globals.css), for the popup. */
export const CAL_BRAND_COLOR = "#2c4bff";

/** The popup always renders dark, in the homepage's near-black palette
 * (`.home` tokens in app/globals.css), whatever the visitor's OS theme. */
export const CAL_THEME = "dark" as const;

/** Month calendar with the picked day's times beside it. */
export const CAL_LAYOUT = "month_view" as const;

const CAL_DARK_VARS: Record<string, string> = {
  "cal-bg": "#0b0c0e", // --paper
  "cal-bg-muted": "#141518", // --paper-2
  "cal-bg-subtle": "#141518",
  "cal-bg-emphasis": "#26272c", // --line
  "cal-border": "#26272c",
  "cal-border-subtle": "#26272c",
  "cal-border-booker": "#26272c",
  "cal-border-emphasis": "#3a3b42",
  "cal-text": "#ededef", // --ink
  "cal-text-emphasis": "#ffffff",
  "cal-text-subtle": "#8e8f98", // --ink-soft
  "cal-text-muted": "#8e8f98",
  "cal-brand": CAL_BRAND_COLOR,
  "cal-brand-emphasis": "#3a58ff",
  "cal-brand-text": "#ffffff",
};

/** Same values for both keys: the theme is forced dark, and this keeps a
 * light fallback from ever showing the stock white palette. */
export const CAL_CSS_VARS = { light: CAL_DARK_VARS, dark: CAL_DARK_VARS };

/** Popup config: month view, dark theme, plus any UTM tags as Cal booking metadata, so
 * the booking records the campaign that brought the visitor. */
export function calConfig(utm: Utm = {}): Record<string, string> {
  const config: Record<string, string> = { layout: CAL_LAYOUT, theme: CAL_THEME };
  for (const [key, value] of Object.entries(utm)) {
    if (value) config[`metadata[${key}]`] = value;
  }
  return config;
}

/** The public booking page — every audit CTA's real `href`, so it still
 * books a call when JavaScript never runs. */
export function calBookingUrl(utm: Utm = {}): string {
  const url = new URL(`https://cal.com/${CAL_LINK}`);
  for (const [key, value] of Object.entries(calConfig(utm))) url.searchParams.set(key, value);
  return url.toString();
}
