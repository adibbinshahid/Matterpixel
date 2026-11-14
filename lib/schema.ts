import { z } from "zod";

/** One ladder, shared by the project wizard and the audit-call wizard, so a
 * visitor who fills both never sees two different ways of asking the same
 * question. Bands touch rather than leaving a hole (a flat $500 answer had
 * nowhere to go between "under 500" and "501+") and every boundary is
 * written the same way — one notation, no "501" next to "2K". */
export const BUDGET_OPTIONS = [
  "Under $500",
  "$500 – $2K",
  "$2K – $5K",
  "$5K+",
  "Not sure yet",
] as const;

export const TIMELINE_OPTIONS = [
  "ASAP",
  "Within a week",
  "Within 1 month",
  "1–2 months",
  "Flexible",
  "Not sure yet",
] as const;

/** One question for "what are we building", replacing the old separate
 * project-type and services questions that asked the same thing twice
 * ("New Website" vs "Web & App Development"). Multi-select. Package and
 * stack links map onto these (see content/packages.ts). */
export const PROJECT_TYPE_OPTIONS = [
  "New website",
  "Website redesign",
  "Web app or software",
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

/** Kept separate from the `.refine`d schema below so the wizard can validate
 * one field at a time (`inquiryFields.shape[id]`) — the client gates each
 * step on the *same* rules the server enforces, instead of a looser hand-
 * rolled copy that let bad values through to the review screen. */
const inquiryFields = z.object({
  fullName: z.string().trim().min(2, "Tell us your name.").max(100, "That name is too long."),
  workEmail: z.string().trim().email("Enter a valid email."),
  whatsapp: z
    .string()
    .trim()
    .max(40, "That number is too long.")
    .optional()
    .refine((v) => !v || /^\+?[\d\s()-]{7,}$/.test(v), "Enter a valid phone number, digits only."),
  company: z.string().trim().max(200, "That name is too long.").optional(),
  website: z
    .string()
    .trim()
    .max(300, "That URL is too long.")
    .optional()
    // Visitors type "www.acme.com" or "acme.com", not "https://acme.com" —
    // requiring the scheme rejected perfectly good answers. The scheme is
    // added before checking (and by the UI on commit) rather than demanded.
    // Not a `.transform` on purpose: that would split this schema's input and
    // output types, which react-hook-form's resolver generics can't take.
    .refine((v) => !v || isValidWebsite(normalizeWebsite(v)), "Enter a valid website, e.g. acme.com"),
  projectTypes: z.array(z.string().max(100)).min(1, "Pick at least one.").max(20),
  budget: z.string().min(1, "Pick a budget range.").max(100),
  projectDetails: z
    .string()
    .trim()
    .min(10, "A few more details would help.")
    .max(2000, "Keep it under 2000 characters."),
  /** What the visitor picked before landing here — a package or a built
   * stack — as the plain-text summary shown on the form. */
  selection: z.string().trim().max(2000).optional(),
  // Honeypot — real visitors never see or fill this field (see InquiryForm).
  // Any value here means a bot filled every input it could find.
  hp: z.string().max(200).optional(),
});

/** Per-field schemas, for validating a single wizard answer in isolation. */
export const inquiryFieldSchemas = inquiryFields.shape;

export const inquirySchema = inquiryFields;

export type InquiryValues = z.infer<typeof inquirySchema>;

export const AUDIT_FOCUS_OPTIONS = [
  "Website Performance",
  "SEO & Visibility",
  "Brand & Identity",
  "Conversion & Funnel",
  "AI & Automation",
  "Content & Social",
] as const;

export const CHALLENGE_OPTIONS = [
  "Not enough leads",
  "Site feels outdated",
  "Traffic doesn't convert",
  "Manual work eats our time",
  "Brand looks inconsistent",
  "Something else",
] as const;

export const ROLE_OPTIONS = [
  "Founder / CEO",
  "Marketing Lead",
  "Product / Ops",
  "Agency Partner",
  "Other",
] as const;

/** Split out of the `bookingSchema` object for the same reason as
 * `inquiryFields` — the booking wizard validates one answer at a time
 * against the exact rules the server will re-run on submit. Required:
 * the slot, name and email. Everything else is optional context. */
const bookingFields = z.object({
  fullName: z.string().trim().min(2, "Tell us your name.").max(100, "That name is too long."),
  email: z.string().trim().email("Enter a valid email."),
  whatsapp: z
    .string()
    .trim()
    .max(40, "That number is too long.")
    .optional()
    .refine((v) => !v || /^\+?[\d\s()-]{7,}$/.test(v), "Enter a valid phone number, digits only."),
  company: z.string().trim().max(200, "That name is too long.").optional(),
  website: z
    .string()
    .trim()
    .max(300, "That URL is too long.")
    .optional()
    .refine((v) => !v || isValidWebsite(normalizeWebsite(v)), "Enter a valid website, e.g. acme.com"),
  // "Help us prepare" answers — all optional, so a call books on slot +
  // name + email alone. Capped rather than enum-checked: the wizard only
  // offers the listed options, and an odd value is harmless in an email.
  role: z.string().max(100).optional(),
  auditFocus: z.array(z.string().max(100)).max(20).optional(),
  challenge: z.string().max(100).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  // The booked instant — the only unambiguous half of a cross-timezone
  // appointment. `preferredDate`/`preferredTime` are what the visitor saw in
  // `timeZone` and travel with it for the confirmation email.
  slotUtc: z
    .string()
    .min(1, "Pick a time.")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Pick a time."),
  preferredDate: z.string().min(1, "Pick a date."),
  preferredTime: z.string().min(1, "Pick a time."),
  timeZone: z.string().min(1, "Pick a time zone."),
  notes: z.string().trim().max(1000, "Keep it under 1000 characters.").optional(),
  // Honeypot — same trick as the inquiry form.
  hp: z.string().max(200).optional(),
});

/** Per-field schemas, for validating a single booking answer in isolation. */
export const bookingFieldSchemas = bookingFields.shape;

export const bookingSchema = bookingFields;

export type BookingValues = z.infer<typeof bookingSchema>;
