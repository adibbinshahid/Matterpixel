/**
 * The service finder (components/services/ServiceFinder.tsx): problem-led
 * packages, the build-your-own stack, and the pure helpers that price a
 * stack. The helpers live here, not in a component, because the contact
 * page runs the same maths on the server to pre-fill the inquiry from
 * `?stack=` — one source, so the quote a visitor saw is the quote we get.
 *
 * Prices must match the pitch deck and content/services.ts. Before/after
 * stats are typical outcomes for the package, shown under a "Typical"
 * label — they are not results from a named client.
 */

/** A number that counts up on reveal. `decimals` keeps 6.2 from rendering
 * as 6 mid-count; `unit` sits beside it, `label` under it. */
export type Stat = { value: number; decimals?: number; unit: string; label: string };

export type ProblemPackage = {
  slug: string;
  /** The chip — the visitor's own words. */
  problem: string;
  name: string;
  headline: string;
  /** Stat tiles, or the before/after image for the visuals package. */
  beforeAfter:
    | { kind: "stats"; before: Stat; after: Stat }
    | { kind: "image"; src: string; alt: string; before: string; after: string };
  items: string[];
  timeline: string;
  priceFrom: number;
  /** Proof card. The project is resolved on the server (name, cover,
   * measured Lighthouse score) so this file never hand-writes a score. */
  proof: { projectSlug: string; label?: string };
};

export const problemPackages: ProblemPackage[] = [
  {
    slug: "fast-site",
    problem: "My site is slow or looks dated",
    name: "Fast Site",
    headline: "A site that loads in under a second and sells.",
    beforeAfter: {
      kind: "stats",
      before: { value: 6.2, decimals: 1, unit: "s", label: "load time" },
      after: { value: 0.8, decimals: 1, unit: "s", label: "load time" },
    },
    items: [
      "Custom design",
      "Mobile-first build",
      "90+ PageSpeed guaranteed",
      "Basic SEO setup",
      "6 months free support",
    ],
    timeline: "7–14 days",
    priceFrom: 700,
    proof: { projectSlug: "shopsphere" },
  },
  {
    slug: "lead-engine",
    problem: "Leads wait hours for a reply",
    name: "Lead Engine",
    headline: "Every lead answered in seconds, booked automatically.",
    beforeAfter: {
      kind: "stats",
      before: { value: 4, unit: "h", label: "to reply" },
      after: { value: 30, unit: "s", label: "to reply" },
    },
    items: [
      "Fast Site included",
      "AI chat + WhatsApp replies",
      "Booking + reminders",
      "CRM pipeline",
      "Automatic follow-ups",
    ],
    timeline: "14–21 days",
    priceFrom: 1200,
    proof: { projectSlug: "mindwell" },
  },
  {
    slug: "ops-automation",
    problem: "My team drowns in manual work",
    name: "Ops Automation",
    headline: "Stop copy-paste. Let workflows run the busywork.",
    beforeAfter: {
      kind: "stats",
      before: { value: 10, unit: "h/week", label: "manual work" },
      after: { value: 1, unit: "h/week", label: "manual work" },
    },
    items: [
      "Process mapping",
      "n8n + AI workflows",
      "Connects Sheets, CRM and store",
      "Invoices and reports on autopilot",
      "You own every workflow",
    ],
    timeline: "7–14 days",
    priceFrom: 500,
    proof: { projectSlug: "lcinco-pizza", label: "L'Cinco Pizza ordering flow" },
  },
  {
    slug: "brand-visuals",
    problem: "My brand looks like everyone else",
    name: "Brand & Visuals",
    headline: "Look premium without a photoshoot.",
    beforeAfter: {
      kind: "image",
      src: "/projects/ai-product-photography/03.webp",
      alt: "A face-cream jar photographed on a table, beside the campaign visual made from it.",
      before: "Phone photo",
      after: "Campaign visual",
    },
    items: [
      "Brand identity",
      "AI product visuals",
      "Video ads",
      "Social kit",
      "Usage rights included",
    ],
    timeline: "5–10 days",
    priceFrom: 300,
    proof: { projectSlug: "ai-product-photography", label: "AI visuals gallery" },
  },
];

export function getProblemPackage(slug: string | undefined) {
  return problemPackages.find((p) => p.slug === slug);
}

/* ── Build your own stack ────────────────────────────────────────────── */

export type StackIcon =
  | "website"
  | "webapp"
  | "chatbot"
  | "whatsapp"
  | "crm"
  | "booking"
  | "software"
  | "branding"
  | "visuals"
  | "seo"
  | "care";

export type StackItem = {
  id: string;
  icon: StackIcon;
  name: string;
  benefit: string;
  /** One-off price range in USD. Omitted for custom-quoted items. */
  price?: { min: number; max: number };
  /** Custom-quoted: adds "+ custom quote" to the total instead of a range. */
  custom?: boolean;
  /** Recurring item — shown beside the one-off total, never summed into it. */
  monthly?: { price: number; note: string };
  /** Typical delivery window in days. Planning estimates for the timeline
   * line, not commitments — the quote fixes the real date. */
  days?: { min: number; max: number };
};

export const stackItems: StackItem[] = [
  {
    id: "website",
    icon: "website",
    name: "Website",
    benefit: "Fast, mobile-first site built to convert.",
    price: { min: 700, max: 1500 },
    days: { min: 7, max: 14 },
  },
  {
    id: "web-app",
    icon: "webapp",
    name: "Web app",
    benefit: "Logins, dashboards and workflows, built custom.",
    price: { min: 700, max: 3000 },
    days: { min: 21, max: 42 },
  },
  {
    id: "ai-chatbot",
    icon: "chatbot",
    name: "AI chatbot",
    benefit: "Answers customers 24/7, trained on your business.",
    price: { min: 300, max: 600 },
    days: { min: 5, max: 10 },
  },
  {
    id: "whatsapp",
    icon: "whatsapp",
    name: "WhatsApp automation",
    benefit: "Auto-replies, order updates and reminders.",
    price: { min: 300, max: 700 },
    days: { min: 5, max: 10 },
  },
  {
    id: "crm",
    icon: "crm",
    name: "CRM & pipeline",
    benefit: "Every lead tracked from first message to sale.",
    price: { min: 400, max: 900 },
    days: { min: 7, max: 14 },
  },
  {
    id: "booking",
    icon: "booking",
    name: "Booking system",
    benefit: "Online booking with automatic reminders.",
    price: { min: 300, max: 600 },
    days: { min: 5, max: 10 },
  },
  {
    id: "business-software",
    icon: "software",
    name: "Business software",
    benefit: "ERPs, internal tools and portals, scoped to you.",
    custom: true,
    days: { min: 21, max: 45 },
  },
  {
    id: "branding",
    icon: "branding",
    name: "Branding",
    benefit: "Logo, colour and type that set you apart.",
    price: { min: 600, max: 1200 },
    days: { min: 7, max: 14 },
  },
  {
    id: "ai-visuals",
    icon: "visuals",
    name: "AI visuals & video",
    benefit: "Campaign-grade product imagery and video ads.",
    price: { min: 300, max: 800 },
    days: { min: 5, max: 10 },
  },
  {
    id: "seo",
    icon: "seo",
    name: "SEO setup",
    benefit: "Technical SEO so customers can find you.",
    price: { min: 600, max: 1200 },
    days: { min: 7, max: 14 },
  },
  {
    id: "care-plan",
    icon: "care",
    name: "Care plan",
    benefit: "Updates, monitoring and fixes every month.",
    monthly: { price: 149, note: "first 6 months free" },
  },
];

/** Bundles of this many one-off items or more get the bundle discount and
 * the timeline buffer. */
export const BUNDLE_THRESHOLD = 3;
export const BUNDLE_NOTE = "Bundles of 3+ get 10% off";
/** Parallel work still needs integration time once a stack gets wide. */
const BUNDLE_TIMELINE_BUFFER = 1.2;

export type StackEstimate = {
  items: StackItem[];
  min: number;
  max: number;
  custom: boolean;
  monthly: StackItem[];
  /** null when nothing selected carries a delivery window. */
  days: { min: number; max: number } | null;
  bundle: boolean;
};

/** Parses `?stack=a,b,c`, dropping unknown and duplicate ids, and keeps
 * catalogue order so the same selection always reads the same way. */
export function parseStack(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const wanted = new Set(raw.split(",").map((s) => s.trim()));
  return stackItems.filter((i) => wanted.has(i.id)).map((i) => i.id);
}

export function estimateStack(ids: string[]): StackEstimate {
  const items = stackItems.filter((i) => ids.includes(i.id));
  const oneOff = items.filter((i) => !i.monthly);
  const bundle = oneOff.length >= BUNDLE_THRESHOLD;
  const timed = oneOff.filter((i) => i.days);
  let days: StackEstimate["days"] = null;
  if (timed.length) {
    const factor = bundle ? BUNDLE_TIMELINE_BUFFER : 1;
    days = {
      min: Math.ceil(Math.max(...timed.map((i) => i.days!.min)) * factor),
      max: Math.ceil(Math.max(...timed.map((i) => i.days!.max)) * factor),
    };
  }
  return {
    items,
    min: oneOff.reduce((sum, i) => sum + (i.price?.min ?? 0), 0),
    max: oneOff.reduce((sum, i) => sum + (i.price?.max ?? 0), 0),
    custom: oneOff.some((i) => i.custom),
    monthly: items.filter((i) => i.monthly),
    days,
    bundle,
  };
}

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** "$700–1,500", "Custom", or "$149/mo". */
export function formatItemPrice(item: StackItem) {
  if (item.monthly) return `${usd(item.monthly.price)}/mo`;
  if (item.custom || !item.price) return "Custom";
  return `${usd(item.price.min)}–${item.price.max.toLocaleString("en-US")}`;
}

/** "$1,300–2,700 + custom quote", or "Custom quote" for software alone. */
export function formatEstimate(e: StackEstimate) {
  const hasRange = e.max > 0;
  const range = hasRange ? `${usd(e.min)}–${e.max.toLocaleString("en-US")}` : "";
  if (e.custom) return hasRange ? `${range} + custom quote` : "Custom quote";
  return range;
}

/**
 * The inquiry pre-fill for /contact. Built from params only, on the server,
 * so a shared link carries the whole request. Capped at the inquiry
 * schema's 2000-character limit for `projectDetails`.
 */
export function buildInquiryPrefill(params: {
  packageSlug?: string;
  stack?: string;
  details?: string;
  partner?: boolean;
}): string | undefined {
  const parts: string[] = [];
  if (params.partner) parts.push("Agency partnership: ");

  const pkg = getProblemPackage(params.packageSlug);
  if (pkg) parts.push(`Package: ${pkg.name} — from ${usd(pkg.priceFrom)}, fixed quote.\n`);

  const ids = parseStack(params.stack);
  if (ids.length) {
    const e = estimateStack(ids);
    const lines = e.items.map((i) => `• ${i.name} (${formatItemPrice(i)})`);
    const summary = [formatEstimate(e)];
    if (e.days) summary.push(`~${e.days.min}–${e.days.max} days`);
    if (e.bundle) summary.push(BUNDLE_NOTE.toLowerCase());
    parts.push(`Quote request:\n${lines.join("\n")}\nEstimate: ${summary.filter(Boolean).join(" · ")}\n`);
  }

  const details = params.details?.trim();
  if (details) parts.push(details);

  if (!parts.length) return undefined;
  return parts.join("\n").slice(0, 2000);
}
