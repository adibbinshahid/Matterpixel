import { z } from "zod";

/** One ladder, shared by the project wizard and the audit-call wizard, so a
 * visitor who fills both never sees two different ways of asking the same
 * question. Bands touch rather than leaving a hole (a flat $500 answer had
 * nowhere to go between "under 500" and "501+") and every boundary is
 * written the same way — one notation, no "501" next to "2K". */
export const BUDGET_OPTIONS = ["Under $500", "$500–1.5k", "$1.5k–5k", "$5k+", "Not sure"] as const;

export const TIMELINE_OPTIONS = ["ASAP", "2–4 weeks", "1–3 months", "Flexible"] as const;

/** The quote form's "service" answer. `slug` travels in links
 * (`/contact?service=ai-automation`), the database and the n8n payload;
 * `label` is what the visitor reads. */
export const SERVICE_OPTIONS = [
  { slug: "website", label: "Website" },
  { slug: "web-app", label: "Web app" },
  { slug: "ai-automation", label: "AI automation" },
  { slug: "booking-system", label: "Booking system" },
  { slug: "brand-visuals", label: "Brand & visuals" },
  { slug: "white-label", label: "White-label" },
  { slug: "other", label: "Other" },
] as const;

export type ServiceSlug = (typeof SERVICE_OPTIONS)[number]["slug"];

const SERVICE_SLUGS = SERVICE_OPTIONS.map((s) => s.slug) as [ServiceSlug, ...ServiceSlug[]];

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" && (SERVICE_SLUGS as string[]).includes(value);
}

export function serviceLabel(slug: string | undefined): string {
  return SERVICE_OPTIONS.find((s) => s.slug === slug)?.label ?? slug ?? "";
}

/** Labels for several picks, comma-separated: "Web Design, AI Automation". */
export function serviceLabels(slugs: readonly string[] | undefined): string {
  return (slugs ?? []).map(serviceLabel).join(", ");
}

/** The kinds of work packages and stack items describe (content/packages.ts).
 * Not asked on the form any more: a link from a package or stack maps its
 * first type onto a `SERVICE_OPTIONS` slug (see `serviceForProjectType`). */
export const PROJECT_TYPE_OPTIONS = [
  "New website",
  "Website redesign",
  "Web app",
  "Business software",
  "AI automation",
  "Branding & identity",
  "AI visuals & video",
  "SEO & marketing",
  "Something else",
] as const;

/** Adds a scheme to a bare domain so `www.acme.com` parses as a URL. Left
 * alone if the visitor already typed one (including http:// — we don't
 * silently upgrade someone's stated protocol). */
export function normalizeWebsite(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

/** A normalized URL that actually names a host with a real TLD — `https://s`
 * parses fine as a URL, which is why the hostname is checked separately. */
export function isValidWebsite(normalized: string): boolean {
  try {
    const { hostname, protocol } = new URL(normalized);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return /^[a-z\d]([a-z\d-]*[a-z\d])?(\.[a-z\d]([a-z\d-]*[a-z\d])?)*\.[a-z]{2,}$/i.test(hostname);
  } catch {
    return false;
  }
}

/** An optional URL field: blank, or a real http(s) address. A missing
 * scheme is added before the check (and by the form on commit) instead of
 * being demanded — visitors type "acme.com", not "https://acme.com". */
const optionalUrl = z
  .string()
  .trim()
  .max(500, "That link is too long.")
  .optional()
  .refine((v) => !v || isValidWebsite(normalizeWebsite(v)), "Enter a valid link, e.g. acme.com");

/**
 * The quote form, validated by this one schema on the client (each wizard
 * step gates on its own fields' slice) and again in POST /api/quote.
 * Kept free of `.transform` so its input and output types match, which
 * react-hook-form's resolver needs; the server normalises URLs itself.
 */
export const quoteSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(80, "Keep it under 80 characters."),
  email: z.string().trim().max(320, "That email is too long.").email("Enter a valid email."),
  website: optionalUrl,
  /** One or more services — the visitor can tick several. */
  service: z
    .array(z.enum(SERVICE_SLUGS, { message: "Pick from the list." }), { message: "Pick at least one." })
    .min(1, "Pick at least one.")
    .max(SERVICE_SLUGS.length),
  details: z
    .string()
    .trim()
    .min(20, "A little more detail, please (20 characters or more).")
    .max(3000, "Keep it under 3000 characters."),
  budget: z.enum(BUDGET_OPTIONS).optional(),
  timeline: z.enum(TIMELINE_OPTIONS).optional(),
  link: optionalUrl,
  /** What the visitor picked before landing here — a package or a built
   * stack — as the plain-text summary shown on the form. */
  selection: z.string().trim().max(2000).optional(),
  /** Which CTA sent the visitor (`?src=`, e.g. `services-stack`). */
  src: z.string().trim().max(100).optional(),
  /** Honeypot. Real visitors never see it; any value means a bot. */
  company_fax: z.string().max(500).optional(),
});

/** Per-field schemas, for validating a single wizard answer in isolation. */
export const quoteFieldSchemas = quoteSchema.shape;

export type QuoteValues = z.infer<typeof quoteSchema>;

const utmValue = z.string().trim().max(200).optional();

/** Campaign tags the browser sends with a quote (from the landing URL). */
export const utmSchema = z
  .object({
    utm_source: utmValue,
    utm_medium: utmValue,
    utm_campaign: utmValue,
    utm_term: utmValue,
    utm_content: utmValue,
  })
  .partial();

export type Utm = z.infer<typeof utmSchema>;
