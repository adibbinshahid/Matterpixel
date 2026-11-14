import { track } from "@vercel/analytics";

/** Every custom Vercel Analytics event the site sends, with its payload. */
type Events = {
  cta_click: { cta: "book" | "quote"; src: string };
  contact_step: { tab: "inquiry" | "booking"; step: number; stepName: string };
  contact_submit: { tab: "inquiry" | "booking"; src: string | null };
  partner_click: { channel: "whatsapp" | "email" };
  quick_question_click: { channel: "whatsapp" | "email" };
};

export type AnalyticsEvent = keyof Events;

/** Fire-and-forget: analytics must never break the click it rides on. */
export function trackEvent<K extends AnalyticsEvent>(name: K, props: Events[K]): void {
  try {
    track(name, props);
  } catch {
    // Blocked or unavailable — nothing to do.
  }
}

/** `/` → "home", `/services/ai-automation` → "services-ai-automation". */
export function pageKey(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? parts.join("-") : "home";
}

/** Keeps a `src` value to the slug alphabet, so a hand-edited link can't put
 * anything odd in the form, the draft or the email. */
export function cleanSrc(raw: string | null | undefined): string | undefined {
  const value = (raw ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
  return value || undefined;
}

/** The `src` a CTA carries: the page it sits on, then its section. */
export function sourceFor(pathname: string, section: string): string {
  return cleanSrc(`${pageKey(pathname)}-${section}`) ?? section;
}
